// src/directives/drag.js

export default {
  bind(el, binding) {
    el.style.cursor = 'move';
    el.style.position = 'absolute';

    let startX, startY, initialLeft, initialTop;
    let isDragging = false;
    let parentRect;

    // 检查元素是否可交互（如input、textarea、select等）
    const isInteractiveElement = (target) => {
      const interactiveTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
      return interactiveTags.includes(target.tagName) || target.isContentEditable;
    };

    el.addEventListener('mousedown', function(e) {
      // 只有当点击的不是可交互元素时才阻止默认行为
      if (!isInteractiveElement(e.target)) {
        e.preventDefault();
      }

      // 如果点击的是可交互元素，则不启动拖拽
      if (isInteractiveElement(e.target)) {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const styles = window.getComputedStyle(el);
      initialLeft = parseInt(styles.left) || 0;
      initialTop = parseInt(styles.top) || 0;

      if (el.parentNode) {
        parentRect = el.parentNode.getBoundingClientRect();
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;

      e.preventDefault(); // 只在拖拽过程中阻止默认行为

      let dx = e.clientX - startX;
      let dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      if (parentRect) {
        const elRect = el.getBoundingClientRect();

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + elRect.width > parentRect.width) {
          newLeft = parentRect.width - elRect.width;
        }
        if (newTop + elRect.height > parentRect.height) {
          newTop = parentRect.height - elRect.height;
        }
      }

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;

      if (typeof binding.value === 'function') {
        binding.value({
          x: newLeft,
          y: newTop,
          element: el
        });
      }
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }
}
