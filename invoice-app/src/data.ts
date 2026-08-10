import type {Customer,Invoice,Service} from './types';
export const seedCustomers:Customer[]=[];
export const seedServices:Service[]=[
 {id:'s1',name:'Private Coaching Session',rate:7500,description:'One-on-one martial arts and fitness coaching'},
 {id:'s2',name:'Self-Defense Workshop',rate:62500,description:'Practical group self-defense workshop'},
 {id:'s3',name:'Fitness Coaching — 4 Weeks',rate:28000,description:'Four-week strength and conditioning programme'},
 {id:'s4',name:'Seminar / Speaking Session',rate:45000,description:'Leadership, discipline and martial arts seminar'}];
export const seedInvoices:Invoice[]=[];
