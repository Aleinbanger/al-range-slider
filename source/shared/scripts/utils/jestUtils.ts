/**
 * Mutates HTMLElement and mocks its dimensions using values in px and 'box-sizing: border-box'.
 */
function mockElementDimensions(element: HTMLElement, {
  width, height, padding = 0, x = 0, y = 0,
}: {
  width: number, height: number, padding?: number, x?: number, y?: number,
}): HTMLElement {
  const mockElement = element;
  mockElement.style.width = `${width}px`;
  mockElement.style.height = `${height}px`;
  mockElement.getBoundingClientRect = jest.fn(() => {
    const rect = {
      x,
      y,
      left: x,
      top: y,
      width,
      height,
      right: x + width,
      bottom: y + height,
    };
    return { ...rect, toJSON: () => rect };
  });
  Object.defineProperties(mockElement, {
    clientWidth: { value: width + 2 * padding },
    clientHeight: { value: height + 2 * padding },
  });
  return mockElement;
}

/**
 * Mocks a simple mouse-like pointer event and dispatches it on HTMLElement.
 * Using MouseEvent, since PointerEvent isn't available in jsdom yet:
 * https://github.com/jsdom/jsdom/issues/2527
 */
function mockPointerEvent(element: HTMLElement, {
  eventType, clientX = 0, clientY = 0,
}: {
  eventType: string, clientX?: number, clientY?: number,
}): void {
  const mockElement = element;
  const pointerEvent = new MouseEvent(eventType, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  });
  mockElement.setPointerCapture = jest.fn(element.setPointerCapture);
  mockElement.releasePointerCapture = jest.fn(element.releasePointerCapture);
  mockElement.dispatchEvent(pointerEvent);
}

export {
  mockElementDimensions,
  mockPointerEvent,
};
