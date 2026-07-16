// src/directives/drag-resizable.js

export default {
  inserted(el, binding) {
    // 确保元素是相对定位，以便绝对定位的拖拽和调整大小手柄正常工作
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    let isDragging = false;
    let isResizing = false;
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    // 检查目标元素是否为调整大小手柄
    const isResizeHandle = (target) => {
      return target.classList && target.classList.contains('resize-handle');
    };

    // 检查目标元素是否为可交互元素（如 input, textarea, select, button 等）
    const isInteractiveElement = (target) => {
      const interactiveTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
      return (
        interactiveTags.includes(target.tagName) ||
        target.isContentEditable ||
        isResizeHandle(target)
      );
    };

    // 创建调整大小手柄
    const createResizeHandle = () => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle');
      handle.style.position = 'absolute';
      handle.style.bottom = '0';
      handle.style.right = '0';
      handle.style.width = '15px';
      handle.style.height = '15px';
      handle.style.cursor = 'se-resize';
      handle.style.backgroundColor = 'transparent';
      // 可选：添加一个视觉提示，例如一个小的边角图标
      handle.style.borderRight = '2px solid #007bff';
      handle.style.borderBottom = '2px solid #007bff';
      return handle;
    };

    // 创建并添加调整大小手柄
    const resizeHandle = createResizeHandle();
    el.appendChild(resizeHandle);

    // 拖拽开始
    const startDrag = (e) => {
      if (isResizeHandle(e.target)) return; // 如果点击的是调整大小手柄，不启动拖拽

      if (isInteractiveElement(e.target)) return; // 如果点击的是可交互元素，不启动拖拽

      isDragging = true;
      const clientX = e.clientX;
      const clientY = e.clientY;

      const styles = window.getComputedStyle(el);
      startLeft = parseInt(styles.left, 10) || 0;
      startTop = parseInt(styles.top, 10) || 0;

      startX = clientX;
      startY = clientY;

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);

      e.preventDefault();
    };

    // 拖拽进行中
    const onDrag = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;

      // 可选：限制拖拽范围在父容器内
      const parentRect = el.parentNode ? el.parentNode.getBoundingClientRect() : null;
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

      // 如果有回调函数，触发回调
      if (typeof binding.value === 'function') {
        binding.value({
          type: 'drag',
          x: newLeft,
          y: newTop,
          element: el,
        });
      }
    };

    // 拖拽结束
    const stopDrag = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    // 调整大小开始
    const startResize = (e) => {
      if (isInteractiveElement(e.target) && !isResizeHandle(e.target)) return; // 如果点击的是非手柄的可交互元素，不启动调整大小

      isResizing = true;
      const clientX = e.clientX;
      const clientY = e.clientY;

      const rect = el.getBoundingClientRect();
      startLeft = parseInt(window.getComputedStyle(el).left, 10) || 0;
      startTop = parseInt(window.getComputedStyle(el).top, 10) || 0;
      startWidth = rect.width;
      startHeight = rect.height;

      startX = clientX;
      startY = clientY;

      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);

      e.preventDefault();
      e.stopPropagation(); // 防止事件冒泡到拖拽逻辑
    };

    // 调整大小进行中
    const onResize = (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      // 设置最小宽高（可以根据需求调整或从 binding.value 读取）
      const minWidth = 100;
      const minHeight = 80;

      if (newWidth < minWidth) newWidth = minWidth;
      if (newHeight < minHeight) newHeight = minHeight;

      el.style.width = `${newWidth}px`;
      el.style.height = `${newHeight}px`;

      // 如果有回调函数，触发回调
      if (typeof binding.value === 'function') {
        binding.value({
          type: 'resize',
          width: newWidth,
          height: newHeight,
          element: el,
        });
      }
    };

    // 调整大小结束
    const stopResize = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
    };

    // 绑定调整大小手柄的 mousedown 事件
    resizeHandle.addEventListener('mousedown', (e) => {
      startResize(e);
    });

    // 绑定元素的 mousedown 事件，用于拖拽
    el.addEventListener('mousedown', (e) => {
      startDrag(e);
    });

    // 可选：添加样式以确保调整大小手柄可见或符合设计需求
    // 例如，您可以调整手柄的颜色、大小等
  },

  // 如果需要在元素被移除时清理事件监听器，可以实现 unbind 钩子
  unbind(el) {
    // 这里可以移除所有添加的事件监听器，防止内存泄漏
    // 由于我们使用了 document.addEventListener，需要更复杂的清理逻辑
    // 为简化起见，这里假设不需要特别清理，但在生产环境中建议实现
  },
};
