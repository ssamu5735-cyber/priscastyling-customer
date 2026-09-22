export type Product={ $id?:string; name:string; slug:string; category:string; description:string; price:number; sizes:string[]; colours:string[]; image:string; gallery?:string[]; status:'Published'|'Draft'|'Sold out'|'Coming soon'; featured?:boolean; hasDiscount?:boolean; originalPrice?:number; discountLabel?:string };
// No seed products: the live catalogue is empty until the store owner adds
// pieces through the admin dashboard, which uploads real photos to Appwrite Storage.
export const seedProducts:Product[]=[];
export const money=(n:number)=>`₦${new Intl.NumberFormat('en-NG').format(n)}`;
export const whatsappNumber=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'2348135296095';
