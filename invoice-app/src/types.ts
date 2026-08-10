export type Status='Draft'|'Sent'|'Paid'|'Overdue'|'Accepted';
export type Customer={id:string;name:string;email:string;phone:string;address:string};
export type Service={id:string;name:string;rate:number;description:string};
export type LineItem={serviceId:string;description:string;qty:number;rate:number};
export type Invoice={id:string;type:'Invoice'|'Estimate';number:string;customerId:string;issueDate:string;dueDate:string;currency:'JMD'|'USD';status:Status;items:LineItem[];discount:number;taxRate:number;notes:string;paymentInstructions:string};
