import { useState } from 'react';
import { ClipboardCheck, ShieldCheck, Send, BookOpen } from 'lucide-react';
import handbookPages from './handbookContent.json';

function Field({ label, name, type='text', required=false, hint, full=false, options }) {
  return <div className={`field ${full?'full':''}`}><label htmlFor={name}>{label}{required && <span className="req"> *</span>}</label>
    {options ? <select id={name} name={name} defaultValue="" required={required}><option value="">Select an option</option>{options.map(x=><option key={x}>{x}</option>)}</select> : type==='textarea' ? <textarea id={name} name={name} rows="3" required={required}/> : <input id={name} name={name} type={type} required={required}/>}
    {hint && <small>{hint}</small>}</div>;
}
function Choice({ label, name, options, required=false, type='radio' }) { return <fieldset className="choice full"><legend>{label}{required&&<span className="req"> *</span>}</legend><div className="choices">{options.map(x=><label key={x}><input type={type} name={name} value={x} required={required&&type==='radio'}/><span>{x}</span></label>)}</div></fieldset>; }
function Section({n,title,desc,children}) { return <section className="section"><div className="section-title"><span>{n}</span><div><h2>{title}</h2>{desc&&<p>{desc}</p>}</div></div><div className="grid">{children}</div></section>; }
export default function App(){
 const [busy,setBusy]=useState(false); const [status,setStatus]=useState(null);
 async function submit(e){e.preventDefault();setBusy(true);setStatus(null);const form=e.currentTarget;const data=new FormData(form);const payload={};for(const [k,v] of data.entries()){if(k in payload)payload[k]=Array.isArray(payload[k])?[...payload[k],v]:[payload[k],v];else payload[k]=v;}
  try{const r=await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/acknowledgements`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await r.json().catch(()=>({}));if(!r.ok)throw new Error(result.message||'Submission failed. Please try again.');setStatus({ok:true,text:result.message||'Your form has been submitted.'});form.reset();window.scrollTo({top:0,behavior:'smooth'});}catch(err){setStatus({ok:false,text:err.message||'Unable to submit. Please try again.'});}finally{setBusy(false);}}
 return <main className="wrap"><header className="hero"><div className="logo"><img src="/support7care-logo.png" alt="Support 7 Care logo" /></div><div><p className="eyebrow">SUPPORT7CARE LIMITED</p><h1>Employment Information & Acknowledgement</h1><p className="sub">Key information, working arrangements and handbook acknowledgement</p></div></header>
 <div className="notice"><ShieldCheck size={21}/><p><strong>Please read before completing.</strong> This form summarises the Key Information Document and selected working policies described in the Support7Care Agency Worker Handbook. It does not replace the complete handbook or your contract. Ask Support7Care if anything is unclear.</p></div>
 {status&&<div role="status" className={`status ${status.ok?'good':'bad'}`}>{status.text}</div>}
 <form onSubmit={submit}>
 <Section n="01" title="Your details" desc="Complete the details used to identify your employment record.">
  <Field label="Full name" name="fullName" required/><Field label="Email address" name="emailAddress" type="email" required/><Field label="Phone number" name="phoneNumber" type="tel"/><Field label="Home address" name="homeAddress" full/><Field label="Postcode" name="postcode"/><Field label="Position / role" name="position" required/><Field label="Date" name="formDate" type="date" required/>
 </Section>
 <Section n="02" title="Key employment information" desc="The following terms are stated in the supplied Key Information Document. The example pay figures are illustrative only and are not a promise of your actual weekly pay.">
  <Field label="Employment business" name="employmentBusiness" required hint="Support7Care LTD"/><Field label="Contract type" name="contractType" required options={['Zero Hours Contract']}/><Field label="Business responsible for paying you" name="payingBusiness" required hint="Support7Care LTD"/><Field label="Pay frequency" name="payFrequency" required options={['Weekly']}/>
  <div className="info-card full"><h3>Pay, deductions and benefits</h3><p><b>Minimum pay:</b> Not less than the applicable National Minimum Wage.</p><p><b>Statutory deductions listed:</b> PAYE income tax, employee National Insurance, employee pension (if applicable), and student loan (if applicable).</p><p><b>Other deductions and fees:</b> None stated in the supplied Key Information Document.</p><p><b>Holiday:</b> Annual leave calculated per hour worked.</p><p><b>Additional benefits:</b> None stated in the supplied document.</p><p><b>Illustrative example in the document:</b> £440 gross weekly pay; £41.60 income tax; £24.96 National Insurance; £13.20 pension; £0 other deductions/fees; £360.24 example net pay. Your actual pay and deductions may differ.</p></div>
  <Choice label="I have read the key employment information above." name="keyInfoAcknowledged" options={['Yes, I acknowledge']} required/>
 </Section>
 <Section n="03" title="Working with Support7Care" desc="These acknowledgements reflect topics covered in the supplied handbook. Please contact the agency for the full policy wording or clarification before agreeing if needed.">
  <div className="handbook-reader full">
    <details>
      <summary><BookOpen size={18}/> Read the full written Agency Worker Handbook <span>{handbookPages.length} sections</span></summary>
      <div className="handbook-copy">
        {handbookPages.map((page, index) => <article key={index}>
          {page.content.split(/\n+/).map((paragraph, pIndex) => paragraph.trim() ? <p key={pIndex}>{paragraph.trim()}</p> : null)}
        </article>)}
      </div>
    </details>
  </div>
  <Choice label="I understand that I must follow applicable agency policies, role requirements and lawful instructions when undertaking assignments." name="policyCompliance" options={['I understand']} required/>
  <Choice label="I understand the importance of safeguarding, reporting concerns or allegations promptly, and treating service users with dignity and respect." name="safeguarding" options={['I understand']} required/>
  <Choice label="I will maintain confidentiality, protect personal information and patient records, and use computers, social media and agency information appropriately." name="confidentiality" options={['I understand']} required/>
  <Choice label="I understand that I must maintain appropriate professional conduct, appearance, timekeeping and fitness to practise, and notify the agency of relevant concerns." name="professionalConduct" options={['I understand']} required/>
  <Choice label="I understand that I must comply with applicable health and safety procedures, required training, occupational health requirements and role-specific procedures, including medicine administration where relevant." name="healthSafetyTraining" options={['I understand']} required/>
  <Choice label="I understand that I must follow the agency's processes for timesheets, payroll, expenses, holiday requests, contact-detail changes and reporting changes that may affect pay or employment." name="payrollProcedures" options={['I understand']} required/>
  <Choice label="I understand that the full written Agency Worker Handbook is available above, and I can contact Support7Care if I need clarification." name="otherPolicies" options={['I understand']} required/>
  <Field label="Questions or points you would like the agency to clarify (optional)" name="questions" type="textarea" full/>
 </Section>
 <Section n="04" title="Working Time Opt-Out Agreement" desc="The source agreement states that opting out is voluntary. Read the agreement carefully and choose your preference.">
  <div className="info-card full">
   <h3>Working Time Opt-Out Agreement</h3>
   <p>In accordance with Regulation 4(1) of the Working Time Regulations 1998, employees can only work for 48 hours per week, including basic work time and overtime. The regulations also allow employees to opt out of this weekly working-hour restriction. The employee can end this agreement by notifying the company.</p>
   <p>By signing this agreement, you indicate your willingness to work for over 48 hours a week if and when available, and that the 48-hour weekly working-time restriction does not apply to your employment with Support7Care Ltd. You understand that signing this agreement is voluntary.</p>
  </div>
  <Choice label="Please select your decision about the 48-hour weekly working-time limit." name="workingTimeOptOutChoice" options={['I voluntarily opt out of the 48-hour weekly working-time limit','I do not wish to opt out of the 48-hour weekly working-time limit']} required/>
  <Field label="Employee name for the working-time agreement" name="workingTimeEmployeeName" required/>
  <Field label="Employee signature (type your full name)" name="workingTimeSignature" required/>
  <Field label="Date signed" name="workingTimeDate" type="date" required/>
 </Section>
 <Section n="05" title="Acknowledgement and declaration" desc="Please complete this section after reading the information and handbook policies available to you.">
  <div className="info-card full"><p>I confirm that the details I have provided are accurate to the best of my knowledge. I acknowledge receipt or access to the key employment information and understand that I should read the full Support7Care Agency Worker Handbook and raise questions with the agency where necessary. This acknowledgement does not amend or replace any contract or statutory rights.</p></div>
  <Field label="Full name (electronic signature)" name="signatureName" required/><Field label="Date signed" name="signatureDate" type="date" required/>
  <Choice label="I confirm the declaration above." name="declarationAccepted" options={['I confirm']} required/>
 </Section>
 <div className="submit"><div><h2>Ready to submit?</h2><p>Submitting sends a copy to Support7Care's configured recruitment email and a confirmation/details email to the address you entered above.</p></div><button disabled={busy} type="submit">{busy?'Submitting…':'Submit form'} <Send size={17}/></button><small>Support7Care Limited · www.support7care.co.uk</small></div>
 </form><footer>Support7Care Limited · Employment Information & Acknowledgement</footer></main>;
}