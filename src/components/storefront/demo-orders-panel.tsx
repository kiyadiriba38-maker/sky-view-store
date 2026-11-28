"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DemoOrder = { id:string; createdAt:string; customer:string; address:string; items:Array<{slug:string;title:string;priceETB:number;quantity:number}>; totalETB:number; paymentMethod:string };

export default function DemoOrdersPanel(){
 const [orders,setOrders]=useState<DemoOrder[]>([]);
 useEffect(()=>{try{setOrders(JSON.parse(localStorage.getItem("sv-demo-orders")||"[]") as DemoOrder[])}catch{setOrders([])}},[]);
 if(!orders.length)return <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center"><p>No demo orders yet.</p><Link href="/shop" className="mt-4 inline-block text-amber-200">Explore the demo catalogue →</Link></div>;
 return <div className="grid gap-4">{orders.map(order=><article key={order.id} className="rounded-2xl border border-white/10 bg-[#191919] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[10px] font-black tracking-widest text-amber-200">DEMO ORDER</span><h2 className="mt-1 font-bold">{order.id}</h2></div><span className="rounded-full bg-cyan-300/10 px-3 py-2 text-xs text-amber-200">Simulated · Processing</span></div><p className="mt-3 text-xs text-white/50">{new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}</p><div className="mt-4 border-t border-white/10 pt-4">{order.items.map(item=><div key={item.slug} className="flex justify-between gap-3 py-2 text-xs"><span>{item.title} × {item.quantity}</span><b>{new Intl.NumberFormat("en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(item.priceETB*item.quantity)}</b></div>)}</div><p className="mt-3 text-right font-bold">{new Intl.NumberFormat("en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(order.totalETB)}</p><p className="mt-2 text-xs text-white/40">Demo tracking events are simulated. No delivery has been arranged.</p></article>)}</div>;
}
