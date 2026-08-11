// types/css.d.ts
// 📦 تعريفات TypeScript لاستيراد ملفات CSS

declare module "*.css" {
  const content: any;
  export default content;
}