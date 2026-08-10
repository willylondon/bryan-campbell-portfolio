import type {Customer,Invoice,Service} from './types';
export const seedCustomers:Customer[]=[
 {id:'c1',name:'Michael Thompson',email:'michael@example.com',phone:'(876) 555-0112',address:'Kingston, Jamaica'},
 {id:'c2',name:'Alpha Prep Academy',email:'admin@alphaprep.edu.jm',phone:'(876) 555-0185',address:'St. Andrew, Jamaica'},
 {id:'c3',name:'Kingston Corporate Group',email:'events@kcg.jm',phone:'(876) 555-0164',address:'New Kingston, Jamaica'}];
export const seedServices:Service[]=[
 {id:'s1',name:'Private Coaching Session',rate:7500,description:'One-on-one martial arts and fitness coaching'},
 {id:'s2',name:'Self-Defense Workshop',rate:62500,description:'Practical group self-defense workshop'},
 {id:'s3',name:'Fitness Coaching — 4 Weeks',rate:28000,description:'Four-week strength and conditioning programme'},
 {id:'s4',name:'Seminar / Speaking Session',rate:45000,description:'Leadership, discipline and martial arts seminar'}];
export const seedInvoices:Invoice[]=[
 {id:'i1',type:'Invoice',number:'INV-2026-003',customerId:'c1',issueDate:'2026-08-02',dueDate:'2026-08-16',currency:'JMD',status:'Paid',items:[{serviceId:'s1',description:'Private coaching — 10 sessions',qty:10,rate:7500}],discount:5000,taxRate:0,notes:'Thank you for training with Master Kukibo.',paymentInstructions:'Payment by bank transfer or cash.'},
 {id:'i2',type:'Invoice',number:'INV-2026-002',customerId:'c2',issueDate:'2026-07-28',dueDate:'2026-08-11',currency:'JMD',status:'Sent',items:[{serviceId:'s2',description:'Self-defense workshop',qty:1,rate:62500}],discount:0,taxRate:0,notes:'',paymentInstructions:'Payment by bank transfer or cash.'},
 {id:'i3',type:'Estimate',number:'EST-2026-001',customerId:'c3',issueDate:'2026-07-21',dueDate:'2026-08-20',currency:'JMD',status:'Accepted',items:[{serviceId:'s4',description:'Corporate leadership seminar',qty:2,rate:45000}],discount:0,taxRate:0,notes:'Estimate valid for 30 days.',paymentInstructions:''}];
