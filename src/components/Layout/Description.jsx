import React, { useEffect } from "react";
import { brandingData } from "../../static/data";
import styles from "../../styles/styles";
const Description = () =>{
   return(
<div className={`${styles.section} hidden sm:block`}>
      <div className={`my-12 flex justify-between p-6`}>
  {brandingData &&
    brandingData.map((i, index) => (

      <div className="flex flex-col items-center mx-[10px]" key={index}>
        {/* Circular container for icon and text */}
        <div className="flex flex-col items-center justify-center rounded-full w-[190px] h-[190px] bg-white shadow-md overflow-hidden p-4 border border-[#FAC50C]"  style={{ boxShadow: "2px 4px 22px rgba(0, 0, 0, 0.15)" }}>
          <div className="flex items-center justify-center w-16 h-16">
            {i.icon}
          </div>
          <h3 className="font-Lato font-bold text-[16px] text-[#1E1E1E] text-center">{i.title}</h3>            
             <p className="text-xs md:text-sm">{i.Description}</p>
        </div>
      </div>
    ))}
</div>

      </div>
   )
}

export default Description;