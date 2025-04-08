import clsx from 'clsx';
import React from 'react';
import Popup from '@/components/Popup';
import PopupButton from './PopupButton';
import HighlightOptions from './HighlightOptions';
import { Position } from '@/utils/sel';
import { HighlightColor, HighlightStyle } from '@/types/book';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';

interface AnnotationPopupProps {
  dir: 'ltr' | 'rtl';
  isVertical: boolean;
  buttons: Array<{ tooltipText: string; Icon: React.ElementType; onClick: () => void }>;
  position: Position;
  trianglePosition: Position;
  highlightOptionsVisible: boolean;
  selectedStyle: HighlightStyle;
  selectedColor: HighlightColor;
  popupWidth: number;
  popupHeight: number;
  onHighlight: (update?: boolean) => void;
}

const OPTIONS_HEIGHT_PIX = 28;
const OPTIONS_PADDING_PIX = 16;

const AnnotationPopup: React.FC<AnnotationPopupProps> = ({
  dir,
  isVertical,
  buttons,
  position,
  trianglePosition,
  highlightOptionsVisible,
  selectedStyle,
  selectedColor,
  popupWidth,
  popupHeight,
  onHighlight,
}) => {
  const highlightOptionsHeightPx = useResponsiveSize(OPTIONS_HEIGHT_PIX);
  const highlightOptionsPaddingPx = useResponsiveSize(OPTIONS_PADDING_PIX);
  return (
    <div dir={dir}>
      <Popup
        width={isVertical ? popupHeight : popupWidth}
        height={isVertical ? popupWidth : popupHeight}
        position={position}
        trianglePosition={trianglePosition}
        className='selection-popup bg-gray-600 text-white'
        triangleClassName='text-gray-600'
      >
        <div
          className={clsx(
            'selection-buttons flex items-center justify-between p-2',
            isVertical ? 'flex-col' : 'flex-row',
          )}
          style={{
            height: isVertical ? popupWidth : popupHeight,
          }}
        >
          {buttons.map((button, index) => (
            <PopupButton
              key={index}
              showTooltip={!highlightOptionsVisible}
              tooltipText={button.tooltipText}
              Icon={button.Icon}
              onClick={button.onClick}
            />
          ))}
        </div>
      </Popup>
      {highlightOptionsVisible && (
        <HighlightOptions
          isVertical={isVertical}
          style={{
            width: `${isVertical ? popupHeight : popupWidth}px`,
            height: `${isVertical ? popupWidth : popupHeight}px`,
            ...(isVertical
              ? {
                  left: `${
                    position.point.x +
                    (highlightOptionsHeightPx + highlightOptionsPaddingPx) *
                      (trianglePosition.dir === 'left' ? -1 : 1)
                  }px`,
                  top: `${position.point.y}px`,
                }
              : {
                  left: `${position.point.x}px`,
                  top: `${
                    position.point.y +
                    (highlightOptionsHeightPx + highlightOptionsPaddingPx) *
                      (trianglePosition.dir === 'up' ? -1 : 1)
                  }px`,
                }),
          }}
          selectedStyle={selectedStyle}
          selectedColor={selectedColor}
          onHandleHighlight={onHighlight}
        />
      )}
    </div>
  );
};

export default AnnotationPopup;
