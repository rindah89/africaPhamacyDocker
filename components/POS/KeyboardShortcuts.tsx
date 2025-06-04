"use client";

import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface KeyboardShortcutsProps {
  onFocusBarcode: () => void;
  onFocusSearch: () => void;
  onClearOrder: () => void;
  onPlaceOrder: () => void;
  canPlaceOrder: boolean;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onFocusBarcode,
  onFocusSearch,
  onClearOrder,
  onPlaceOrder,
  canPlaceOrder
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Prevent default for our shortcuts
      if (event.ctrlKey || event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'b': // Ctrl+B or Alt+B - Focus barcode scanner
            event.preventDefault();
            onFocusBarcode();
            toast.success('Barcode scanner focused');
            break;
          
          case 's': // Ctrl+S or Alt+S - Focus search
            event.preventDefault();
            onFocusSearch();
            toast.success('Search focused');
            break;
          
          case 'c': // Ctrl+C or Alt+C - Clear order
            event.preventDefault();
            onClearOrder();
            break;
          
          case 'enter': // Ctrl+Enter or Alt+Enter - Place order
            if (canPlaceOrder) {
              event.preventDefault();
              onPlaceOrder();
            }
            break;
        }
      }

      // F keys without modifiers
      switch (event.key) {
        case 'F1': // F1 - Focus barcode scanner
          event.preventDefault();
          onFocusBarcode();
          toast.success('Barcode scanner focused');
          break;
        
        case 'F2': // F2 - Focus search
          event.preventDefault();
          onFocusSearch();
          toast.success('Search focused');
          break;
        
        case 'F9': // F9 - Clear order
          event.preventDefault();
          onClearOrder();
          break;
        
        case 'F12': // F12 - Place order
          if (canPlaceOrder) {
            event.preventDefault();
            onPlaceOrder();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFocusBarcode, onFocusSearch, onClearOrder, onPlaceOrder, canPlaceOrder]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs max-w-xs">
        <div className="font-semibold mb-2">Keyboard Shortcuts</div>
        <div className="space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">F1</kbd> or <kbd className="bg-gray-700 px-1 rounded">Ctrl+B</kbd> - Focus Barcode Scanner</div>
          <div><kbd className="bg-gray-700 px-1 rounded">F2</kbd> or <kbd className="bg-gray-700 px-1 rounded">Ctrl+S</kbd> - Focus Search</div>
          <div><kbd className="bg-gray-700 px-1 rounded">F9</kbd> or <kbd className="bg-gray-700 px-1 rounded">Ctrl+C</kbd> - Clear Order</div>
          {canPlaceOrder && (
            <div><kbd className="bg-gray-700 px-1 rounded">F12</kbd> or <kbd className="bg-gray-700 px-1 rounded">Ctrl+Enter</kbd> - Place Order</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts; 