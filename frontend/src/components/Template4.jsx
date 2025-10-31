// src/components/Template2.jsx
import { useState, useEffect } from "react";

export default function Template4() {

  const [data,setData] = useState(null);

  useEffect(()=>{
    setData({
      contact:["+91 9876543210","pratik@example.com","Satara, MH"],
      skills:["JavaScript","React","Node","Express","MongoDB","REST APIs","JWT Auth"],
      tools:["Git & GitHub","VS Code","Postman","Cloudinary","Netlify/Render"],
      languages:["English (Fluent)","Hindi (Fluent)","Marathi (Native)"],
      name:"PRATIK SATPUTE",
      title:"MERN Stack Developer",
      summary:"Full stack developer with real deployment experience. Skilled in modular frontend design, backend APIs, auth, and production-grade MongoDB systems.",
      experience:[
        {role:"MERN Intern — Remote Startup",time:"2024 — Present",desc:"Built real-world features · JWT auth · Cloud upload · API + UI integration"},
        {role:"Freelance Developer",time:"2023 — 2024",desc:"Delivered client CRUD apps · Payment sandbox · Responsive admin dashboards"}
      ],
      projects:[
        "CultiKure — Crop disease prediction (CNN + Flask + JS)",
        "Hospital Bed Booking — Node, Mongo, Auth, Cloudinary",
        "Travel Listing App — Express, Mongo, EJS, CRUD + Reviews"
      ],
      education:["B.Tech — Computer Engineering (2022–2026)"]
    });
  },[]);

  if(!data) return null;

  return (
    <div style={{
      width:"794px",       // A4 width @96dpi
      minHeight:"1123px",  // A4 height
      margin:"0 auto",
      fontFamily:"Calibri, Arial",
      padding:"40px"
    }}>

      {/* NAME & ROLE */}
      <h1 style={{margin:"0",fontSize:"28px"}}>{data.name}</h1>
      <p style={{fontSize:"15px",margin:"4px 0 14px",color:"#0d6efd"}}>{data.title}</p>

      {/* CONTACT */}
      <h3 style={{fontSize:"15px",marginBottom:"4px"}}>CONTACT</h3>
      {data.contact.map((c,i)=><p key={i} style={{fontSize:"13px",margin:"2px 0"}}>{c}</p>)}
      <hr style={{margin:"18px 0"}}/>

      {/* SUMMARY */}
      <h3 style={{fontSize:"15px"}}>SUMMARY</h3>
      <p style={{fontSize:"14px"}}>{data.summary}</p>
      <hr style={{margin:"18px 0"}}/>

      {/* EXPERIENCE */}
      <h3 style={{fontSize:"15px"}}>EXPERIENCE</h3>
      {data.experience.map((e,i)=>(
        <div key={i} style={{marginBottom:"14px"}}>
          <b>{e.role}</b><span style={{float:"right"}}>{e.time}</span>
          <p style={{fontSize:"13px",marginTop:"4px"}}>{e.desc}</p>
        </div>
      ))}
      <hr style={{margin:"18px 0"}}/>

      {/* PROJECTS */}
      <h3 style={{fontSize:"15px"}}>PROJECTS</h3>
      <ul style={{fontSize:"14px",marginTop:"6px"}}>
        {data.projects.map((p,i)=><li key={i}>{p}</li>)}
      </ul>
      <hr style={{margin:"18px 0"}}/>

      {/* SKILLS & OTHER */}
      <h3 style={{fontSize:"15px"}}>SKILLS</h3>
      <p style={{fontSize:"14px"}}>{data.skills.join(" · ")}</p>

      <h3 style={{fontSize:"15px",marginTop:"14px"}}>TOOLS</h3>
      <p style={{fontSize:"14px"}}>{data.tools.join(" · ")}</p>

      <h3 style={{fontSize:"15px",marginTop:"14px"}}>LANGUAGES</h3>
      <p style={{fontSize:"14px"}}>{data.languages.join(" · ")}</p>
      <hr style={{margin:"18px 0"}}/>

      {/* EDUCATION */}
      <h3 style={{fontSize:"15px"}}>EDUCATION</h3>
      {data.education.map((e,i)=><p key={i} style={{fontSize:"14px"}}>{e}</p>)}

    </div>
  );
}
