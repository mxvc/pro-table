---
title: 基本用法
order: 2
group:
  path: /
nav:
  title: 文档
  path: /
---

<code src="./demos/basic.jsx"   background="#f5f5f5" />



<API src="../packages/table/src/index.tsx"></API>



## 去掉的功能

为了减少心智负担，将很多功能去掉。大原则是配置式改为用户自定义 ReactNode， 减少开发过程中对文档的查看

###

- 编辑模式 editable
- rowKey 不再支持 函数

### 列配置

- renderText 统一使用 render
- valueEnum 使用 render 自行设置，最好是把枚举放到最前面
- copyable
- ellipsis
- title 不再支持函数
- filter 相关的， 可直接使用 antd table 的

