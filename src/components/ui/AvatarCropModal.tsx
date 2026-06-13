import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '../Modal';
import { cropImageToSquare, getInitialCoverScale } from '../../utils/cropImageToSquare';

const CROP_SIZE = 280;
const OUTPUT_SIZE = 400;

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export function AvatarCropModal({ isOpen, imageSrc, onClose, onConfirm }: AvatarCropModalProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setNaturalSize({ w: 0, h: 0 });
      return;
    }
    const img = new Image();
    img.onload = () => {
      const base = getInitialCoverScale(img.naturalWidth, img.naturalHeight, CROP_SIZE);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setScale(base);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  const baseScale =
    naturalSize.w > 0 ? getInitialCoverScale(naturalSize.w, naturalSize.h, CROP_SIZE) : 1;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    setOffset({
      x: dragRef.current.startOffsetX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.startOffsetY + (e.clientY - dragRef.current.startY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const handleConfirm = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.complete || naturalSize.w === 0) return;
    const cropped = cropImageToSquare(img, scale, offset.x, offset.y, CROP_SIZE, OUTPUT_SIZE);
    if (cropped) onConfirm(cropped);
  }, [scale, offset, onConfirm, naturalSize.w]);

  if (!imageSrc) return null;

  const dw = naturalSize.w * scale;
  const dh = naturalSize.h * scale;
  const ix = (CROP_SIZE - dw) / 2 + offset.x;
  const iy = (CROP_SIZE - dh) / 2 + offset.y;
  const ready = naturalSize.w > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h5 className="modal-title">Crop Profile Photo</h5>
      </div>
      <div className="modal-body">
        <p className="text-muted mb-2">Drag to reposition. Use the slider to zoom.</p>
        <div
          className="avatar-crop-viewport mx-auto"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {ready && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                position: 'absolute',
                width: dw,
                height: dh,
                left: ix,
                top: iy,
                maxWidth: 'none',
                userSelect: 'none',
                touchAction: 'none',
              }}
            />
          )}
        </div>
        <div className="form-group basic mt-3">
          <label className="label" htmlFor="avatarCropZoom">
            Zoom
          </label>
          <input
            id="avatarCropZoom"
            type="range"
            className="form-range"
            min={baseScale}
            max={baseScale * 3}
            step={0.01}
            value={scale}
            disabled={!ready}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="modal-footer">
        <div className="btn-inline">
          <button type="button" className="btn btn-text-secondary" onClick={onClose}>
            CANCEL
          </button>
          <button type="button" className="btn btn-text-primary" onClick={handleConfirm} disabled={!ready}>
            APPLY
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AvatarCropModal;
