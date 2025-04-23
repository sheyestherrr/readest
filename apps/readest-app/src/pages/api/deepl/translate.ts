import { NextApiRequest, NextApiResponse } from 'next';
import { corsAllMethods, runMiddleware } from '@/utils/cors';
import { supabase } from '@/utils/supabase';
import { getUserPlan } from '@/utils/access';
import { query as deeplQuery } from '@/utils/deepl';

const DEFAULT_DEEPL_FREE_API = 'https://api-free.deepl.com/v2/translate';
const DEFAULT_DEEPL_PRO_API = 'https://api.deepl.com/v2/translate';

const getUserAndToken = async (authHeader: string | undefined) => {
  if (!authHeader) return {};

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return {};
  return { user, token };
};

const LANG_V2_V1_MAP: Record<string, string> = {
  'ZH-HANS': 'ZH',
  'ZH-HANT': 'ZH-TW',
};

const getDeepLAPIKey = (keys: string | undefined) => {
  const keyArray = keys?.split(',') ?? [];
  return keyArray.length ? keyArray[Math.floor(Math.random() * keyArray.length)] : '';
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, corsAllMethods);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, token } = await getUserAndToken(req.headers['authorization']);
  const { DEEPL_PRO_API, DEEPL_FREE_API } = process.env;
  const deepFreeApiUrl = DEEPL_FREE_API || DEFAULT_DEEPL_FREE_API;
  const deeplProApiUrl = DEEPL_PRO_API || DEFAULT_DEEPL_PRO_API;

  let deeplApiUrl = deepFreeApiUrl;
  let userPlan = 'free';
  if (user && token) {
    userPlan = getUserPlan(token);
    if (userPlan === 'pro') deeplApiUrl = deeplProApiUrl;
  } else {
    res.status(403).json({ error: 'Not authenticated' });
  }
  const deeplAuthKey =
    deeplApiUrl === deeplProApiUrl
      ? getDeepLAPIKey(process.env['DEEPL_PRO_API_KEYS'])
      : getDeepLAPIKey(process.env['DEEPL_FREE_API_KEYS']);

  const {
    text,
    source_lang: sourceLang = 'AUTO',
    target_lang: targetLang = 'EN',
  }: { text: string[]; source_lang: string; target_lang: string } = req.body;
  try {
    if (user && token) {
      const isV2Api = deeplApiUrl.endsWith('/v2/translate');
      const requestBody = {
        text: isV2Api ? text : (text[0] ?? ''),
        source_lang: isV2Api ? sourceLang : (LANG_V2_V1_MAP[sourceLang] ?? sourceLang),
        target_lang: isV2Api ? targetLang : (LANG_V2_V1_MAP[targetLang] ?? targetLang),
      };
      const response = await fetch(deeplApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${deeplAuthKey}`,
          'x-fingerprint': process.env['DEEPL_X_FINGERPRINT'] || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      const result = {
        ...data,
        translations: data.translations || [
          {
            text: data.data,
          },
        ],
      };
      res.status(response.status).json(result);
    } else {
      const result = await deeplQuery({
        text: text[0] ?? '',
        sourceLang,
        targetLang,
      });
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error proxying DeepL request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
