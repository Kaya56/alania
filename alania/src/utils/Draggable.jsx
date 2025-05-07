import React, { useState, useRef, useEffect, useCallback } from 'react';

function Draggable({ children, bounds = true }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startDragPos = useRef({ startMouseX: 0, startMouseY: 0, startOffsetX: 0, startOffsetY: 0 });
  const relativePosition = useRef({ relX: 0, relY: 0 });

  const getBasePosition = useCallback(() => {
    if (!dragRef.current) return { x: 0, y: 0 };
    const rect = dragRef.current.getBoundingClientRect();
    return { x: rect.left - offset.x, y: rect.top - offset.y };
  }, [offset]);

  const computeRelativePosition = useCallback(() => {
    if (!dragRef.current) return;
    const base = getBasePosition();
    const el = dragRef.current;
    const centerX = base.x + el.offsetWidth / 2;
    const centerY = base.y + el.offsetHeight / 2;
    relativePosition.current = {
      relX: centerX / window.innerWidth,
      relY: centerY / window.innerHeight,
    };
  }, [getBasePosition]);

  const handleResize = useCallback(() => {
    if (!dragRef.current) return;
    const base = getBasePosition();
    const el = dragRef.current;
    const desiredCenterX = relativePosition.current.relX * window.innerWidth;
    const desiredCenterY = relativePosition.current.relY * window.innerHeight;
    let newOffsetX = desiredCenterX - (base.x + el.offsetWidth / 2);
    let newOffsetY = desiredCenterY - (base.y + el.offsetHeight / 2);

    if (bounds) {
      newOffsetX = Math.max(0 - base.x, Math.min(newOffsetX, window.innerWidth - (base.x + el.offsetWidth)));
      newOffsetY = Math.max(0 - base.y, Math.min(newOffsetY, window.innerHeight - (base.y + el.offsetHeight)));
    }
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [getBasePosition, bounds]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const onMouseDown = (e) => {
    setIsDragging(true);
    startDragPos.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startDragPos.current.startMouseX;
    const deltaY = e.clientY - startDragPos.current.startMouseY;
    let newOffsetX = startDragPos.current.startOffsetX + deltaX;
    let newOffsetY = startDragPos.current.startOffsetY + deltaY;

    if (bounds && dragRef.current) {
      const base = getBasePosition();
      const el = dragRef.current;
      newOffsetX = Math.max(0 - base.x, Math.min(newOffsetX, window.innerWidth - (base.x + el.offsetWidth)));
      newOffsetY = Math.max(0 - base.y, Math.min(newOffsetY, window.innerHeight - (base.y + el.offsetHeight)));
    }
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const onMouseUp = () => {
    setIsDragging(false);
    computeRelativePosition();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove]);

  useEffect(() => {
    computeRelativePosition();
  }, [computeRelativePosition]);

  // On fusionne les styles de l'enfant avec ceux liés au drag
  const childElement = React.Children.only(children);
  const mergedStyle = {
    ...childElement.props.style,
    transform: `translate(${offset.x}px, ${offset.y}px) ${childElement.props.style?.transform || ""}`,
    cursor: isDragging ? "grabbing" : "grab", // Change le curseur selon l'état de drag
  };

  const clonedChild = React.cloneElement(childElement, {
    ref: dragRef,
    style: mergedStyle,
    onMouseDown,
  });

  return clonedChild;
}

export default Draggable;
