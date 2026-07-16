// src/directives/resizable.js

export default {
  inserted(el, binding) {
    let isResizing = false;
    let currentHandle = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    // 最小宽高（可配置，后续可优化为从 binding.value 读取）
    const minWidth = 100;
    const minHeight = 80;

    /*
      * 创建一个指定类型的拖拽手柄
      * @param { 'right' | 'bottom' | 'corner' } position
      * @returns { HTMLDivElement }
      */
    const createResizeHandle = (position) => {
      const handle = document.createElement('div');
      handle.style.position = 'absolute';
      handle.style.backgroundColor = 'transparent';

      if (position === 'right') {
        // 右侧拖拽条
        handle.style.top = '0';
        handle.style.right = '0';
        handle.style.width = '5px';
        handle.style.height = '100%';
        handle.style.cursor = 'col-resize';
      } else if (position === 'bottom') {
        // 底部拖拽条
        handle.style.bottom = '0';
        handle.style.left = '0';
        handle.style.height = '5px';
        handle.style.width = '100%';
        handle.style.cursor = 'row-resize';
      } else if (position === 'corner') {
        // 右下角拖拽区域（推荐）
        handle.style.bottom = '0';
        handle.style.right = '0';
        handle.style.width = '15px';
        handle.style.height = '15px';
        handle.style.cursor = 'se-resize';
        handle.style.background = 'transparent';

        // 添加标识（比如一个文本或图标）
        const identifier = document.createElement('span');
        identifier.textContent = '⋰'; // 这里可以替换成你想要的标识，比如 '⤡', '⋱', 或者使用图标字体
        identifier.style.position = 'absolute';
        identifier.style.bottom = '0';
        identifier.style.right = '0';
        identifier.style.fontSize = '12px'; // 调整字体大小
        identifier.style.color = '#000'; // 设置颜色，可以根据需要调整
        identifier.style.pointerEvents = 'none'; // 确保点击事件穿透到父元素
        handle.appendChild(identifier);
      }

      return handle;
    };

    /*
      * 获取鼠标事件的坐标
      */
    const getEventPos = (e) => ({
      x: e.clientX,
      y: e.clientY,
    });

    /*
      * 开始调整大小
      */
    const startResize = (e, handleType) => {
      isResizing = true;
      currentHandle = handleType;
      const pos = getEventPos(e);
      startX = pos.x;
      startY = pos.y;

      const rect = el.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);

      e.preventDefault();
    };

    /*
      * 执行调整大小
      */
    const doResize = (e) => {
      if (!isResizing) return;

      const pos = getEventPos(e);
      const deltaX = pos.x - startX;
      const deltaY = pos.y - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (currentHandle === 'right' || currentHandle === 'corner') {
        newWidth = startWidth + deltaX;
        if (newWidth < minWidth) newWidth = minWidth;
      }

      if (currentHandle === 'bottom' || currentHandle === 'corner') {
        newHeight = startHeight + deltaY;
        if (newHeight < minHeight) newHeight = minHeight;
      }

      if (newWidth !== startWidth || newHeight !== startHeight) {
        el.style.width = `${newWidth}px`;
        el.style.height = `${newHeight}px`;
      }
    };

    /*
      * 停止调整大小
      */
    const stopResize = () => {
      isResizing = false;
      currentHandle = null;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };

    // 确保元素是相对定位，手柄是绝对定位
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    // 创建并添加 右下角拖拽手柄（推荐）
    const cornerHandle = createResizeHandle('corner');
    el.appendChild(cornerHandle);

    // 可选：创建并添加 右侧拖拽条 和 底部拖拽条（如需更细粒度控制，可启用）
    /*
    const rightHandle = createResizeHandle('right');
    el.appendChild(rightHandle);

    const bottomHandle = createResizeHandle('bottom');
    el.appendChild(bottomHandle);
    */

    // 绑定右下角拖拽事件（推荐）
    cornerHandle.addEventListener('mousedown', (e) => {
      startResize(e, 'corner');
    });

    // 如需分别支持 右侧 / 底部 拖拽，取消注释以下代码：
    /*
    rightHandle.addEventListener('mousedown', (e) => {
      startResize(e, 'right');
    });

    bottomHandle.addEventListener('mousedown', (e) => {
      startResize(e, 'bottom');
    });
    */
  },
};
