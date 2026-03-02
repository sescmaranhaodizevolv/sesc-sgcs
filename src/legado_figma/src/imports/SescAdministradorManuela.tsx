import svgPaths from "./svg-brynynl3om";

function Text() {
  return (
    <div className="h-[28px] relative shrink-0 w-[44.557px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[28px] items-start relative w-[44.557px]">
        <p className="font-['Arial:Bold',_sans-serif] leading-[28px] not-italic relative shrink-0 text-[#003366] text-[20px] text-nowrap whitespace-pre">SESC</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white h-[64px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[64px] items-center justify-center pl-0 pr-[0.011px] py-0 relative w-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[112.727px] relative shrink-0 w-[250px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#004080] border-[0px_0px_0.727px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[112.727px] items-start pb-[0.727px] pt-[24px] px-[61px] relative w-[250px]">
        <Container />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/2 left-[12.5%] right-[58.33%] top-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-11.11%_-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 10">
            <path d={svgPaths.p11f10ef0} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_12.5%_66.67%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-20%_-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
            <path d={svgPaths.pec22bb2} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[12.5%] left-[58.33%] right-[12.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-11.11%_-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 10">
            <path d={svgPaths.p11f10ef0} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[66.67%_58.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-20%_-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
            <path d={svgPaths.pec22bb2} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Dashboard</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[44px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[16px] w-[218px]" data-name="Button">
      <Text1 />
      <Text2 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-5%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 19">
            <path d={svgPaths.p2148c380} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_16.67%_66.67%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-16.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d={svgPaths.p3ce6d700} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_58.33%_62.5%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 2">
            <path d="M2.66667 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[54.17%_33.33%_45.83%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 2">
            <path d="M7.66667 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[70.83%_33.33%_29.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 2">
            <path d="M7.66667 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Processos</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
            <path d="M1 1L5 5L9 1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[44px] items-center px-[16px] py-0 relative w-full">
          <Text3 />
          <Text4 />
          <Text5 />
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-5%_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 17">
            <path d={svgPaths.p367f2700} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_16.67%_66.67%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-16.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d={svgPaths.p23369320} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_58.33%_62.5%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.75px_-50%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 2">
            <path d="M2.5 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[54.17%_33.33%_45.83%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.75px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 2">
            <path d="M7 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[70.83%_33.33%_29.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-0.75px_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 2">
            <path d="M7 1H1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon3 />
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[-2px] w-[114px]">Gerenciamento de Processos</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[64px] items-center left-[24px] px-[16px] py-0 rounded-[10px] top-0 w-[194px]" data-name="Button">
      <Text6 />
      <Text7 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[45.83%_8.33%_29.17%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-16.667%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d="M1 5.5H5.5V1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-10%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 10">
            <path d={svgPaths.p17a52280} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[-2px] w-[76px]">Histórico de Desistências</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[64px] items-center left-[24px] px-[16px] py-0 rounded-[10px] top-[68px] w-[194px]" data-name="Button">
      <Text8 />
      <Text9 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[8.33%] left-1/2 right-1/2 top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%_-0.75px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 17">
            <path d="M1 1V16" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[20.83%] left-1/4 right-1/4 top-[20.83%]" data-name="Vector">
        <div className="absolute inset-[-7.14%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 13">
            <path d={svgPaths.p3b9a3e80} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text10() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon5 />
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[-2px] w-[112px]">Realinhamento de Preços</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[64px] items-center left-[24px] px-[16px] py-0 rounded-[10px] top-[136px] w-[194px]" data-name="Button">
      <Text10 />
      <Text11 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.44%_8.34%_12.5%_8.26%]" data-name="Vector">
        <div className="absolute inset-[-5.55%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 16">
            <path d={svgPaths.p284f7100} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[45.83%] left-1/2 right-1/2 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.75px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M1 1V4" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.75px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
            <path d="M1 1H1.0075" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text12() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Penalidades</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bg-[#001f3f] box-border content-stretch flex gap-[12px] h-[44px] items-center left-[24px] px-[16px] py-0 rounded-[10px] top-[204px] w-[194px]" data-name="Button">
      <Text12 />
      <Text13 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-3/4 left-[33.33%] right-[66.67%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.75px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M1 1V4" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[66.67%] right-[33.33%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.75px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M1 1V4" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[16.67%_12.5%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.556%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.pfd9e500} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_12.5%_58.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-0.75px_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 2">
            <path d="M1 1H14.5" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text14() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon7 />
      </div>
    </div>
  );
}

function Text15() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[-2px] w-[102px]">Prorrogações de Processos</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[64px] items-center left-[24px] px-[16px] py-0 rounded-[10px] top-[252px] w-[194px]" data-name="Button">
      <Text14 />
      <Text15 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[316px] relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[364px] items-start left-[16px] top-[68px] w-[218px]" data-name="Container">
      <Button1 />
      <Container2 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[8.33%] left-1/4 right-1/4 top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 19">
            <path d={svgPaths.p3d596c80} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-[8.33%] right-3/4 top-1/2" data-name="Vector">
        <div className="absolute inset-[-10%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 11">
            <path d={svgPaths.p3b16b580} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-3/4 right-[8.33%] top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-7.69%_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 13">
            <path d={svgPaths.pa0310c0} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[41.67%] right-[41.67%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 2">
            <path d="M1 1H4.33333" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_41.67%_58.33%_41.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 2">
            <path d="M1 1H4.33333" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_41.67%_41.67%_41.67%]" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 2">
            <path d="M1 1H4.33333" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[41.67%] right-[41.67%] top-3/4" data-name="Vector">
        <div className="absolute inset-[-0.83px_-25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 2">
            <path d="M1 1H4.33333" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text16() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon8 />
      </div>
    </div>
  );
}

function Text17() {
  return (
    <div className="basis-0 grow h-[40px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[40px] relative w-full">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-0 not-italic text-[14px] text-white top-[-2px] w-[84px]">Contratos e Fornecedores</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[64px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[440px] w-[218px]" data-name="Button">
      <Text16 />
      <Text17 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
            <path d={svgPaths.p36241e80} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-3/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-12.5%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 9">
            <path d="M1 7.66667V1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_45.83%_29.17%_54.17%]" data-name="Vector">
        <div className="absolute inset-[-8.33%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 12">
            <path d="M1 11V1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[58.33%_66.67%_29.17%_33.33%]" data-name="Vector">
        <div className="absolute inset-[-33.33%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 5">
            <path d="M1 3.5V1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text18() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon9 />
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Relatórios</p>
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[44px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[512px] w-[218px]" data-name="Button">
      <Text18 />
      <Text19 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 7">
            <path d={svgPaths.p2ce91780} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[13.03%_20.85%_54.7%_66.67%]" data-name="Vector">
        <div className="absolute inset-[-12.92%_-33.38%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 9">
            <path d={svgPaths.p7c65100} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[63.04%_8.33%_12.5%_79.17%]" data-name="Vector">
        <div className="absolute inset-[-17.04%_-33.33%_-17.04%_-33.34%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 7">
            <path d={svgPaths.p217f1840} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
            <path d={svgPaths.p300b4600} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text20() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon10 />
      </div>
    </div>
  );
}

function Text21() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Usuários</p>
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[44px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[564px] w-[218px]" data-name="Button">
      <Text20 />
      <Text21 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_12.5%_66.67%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 7">
            <path d={svgPaths.pc9ac200} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_12.5%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 16">
            <path d={svgPaths.p31b45000} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[37.5%] left-[12.5%] right-[12.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-33.33%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 5">
            <path d={svgPaths.p3d8bff00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text22() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon11 />
      </div>
    </div>
  );
}

function Text23() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Integrações</p>
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
            <path d="M1 1L5 5L9 1" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text24() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon12 />
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[44px] items-center px-[16px] py-0 relative w-full">
          <Text22 />
          <Text23 />
          <Text24 />
        </div>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_12.5%_66.67%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 7">
            <path d={svgPaths.p17335700} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_12.5%_8.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 15">
            <path d={svgPaths.p2733f540} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[37.5%] left-[12.5%] right-[12.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-33.33%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 4">
            <path d={svgPaths.p3a83fd00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text25() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon13 />
      </div>
    </div>
  );
}

function Text26() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Envio Automático</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[44px] items-center px-[16px] py-0 relative w-full">
          <Text25 />
          <Text26 />
        </div>
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
            <path d={svgPaths.p30432a00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.95%_8.94%_45.48%_45.48%]" data-name="Vector">
        <div className="absolute inset-[-9.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
            <path d="M9.205 1L1 9.20425" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text27() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[18px]">
        <Icon14 />
      </div>
    </div>
  );
}

function Text28() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Envio Automático</p>
      </div>
    </div>
  );
}

function Button12() {
  return (
    <div className="h-[44px] relative rounded-[10px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[12px] h-[44px] items-center px-[16px] py-0 relative w-full">
          <Text27 />
          <Text28 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[92px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[4px] h-[92px] items-start pl-[24px] pr-0 py-0 relative w-full">
          <Button11 />
          <Button12 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[140px] items-start left-[16px] top-[616px] w-[218px]" data-name="Container">
      <Button10 />
      <Container4 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%_8.32%_16.67%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.88%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 16">
            <path d={svgPaths.p378ccc00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text29() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon15 />
      </div>
    </div>
  );
}

function Text30() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-white">Documentos</p>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[44px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[764px] w-[218px]" data-name="Button">
      <Text29 />
      <Text30 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.333%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
            <path d={svgPaths.p1da8ee00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.15%_37.83%_45.83%_37.88%]" data-name="Vector">
        <div className="absolute inset-[-16.65%_-17.15%_-16.66%_-17.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 7">
            <path d={svgPaths.p23170780} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[29.17%] left-1/2 right-[49.96%] top-[70.83%]" data-name="Vector">
        <div className="absolute inset-[-0.833px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 2">
            <path d="M1 1H1.00833" id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text31() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[20px]">
        <Icon16 />
      </div>
    </div>
  );
}

function Text32() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[20px] items-start relative w-full">
        <p className="font-['Arial:Regular',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">Suporte e Configurações</p>
      </div>
    </div>
  );
}

function Button14() {
  return (
    <div className="absolute box-border content-stretch flex gap-[12px] h-[44px] items-center left-[16px] px-[16px] py-0 rounded-[10px] top-[816px] w-[218px]" data-name="Button">
      <Text31 />
      <Text32 />
    </div>
  );
}

function Navigation() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[250px]" data-name="Navigation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[250px]">
        <Button />
        <Container3 />
        <Button7 />
        <Button8 />
        <Button9 />
        <Container5 />
        <Button13 />
        <Button14 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[109.08px] not-italic text-[#d1d5dc] text-[12px] text-center top-[-1px] translate-x-[-50%] w-[165px]">© 2025 SESC. Todos os direitos reservados.</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[64.727px] relative shrink-0 w-[250px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#004080] border-[0.727px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[64.727px] items-start pb-0 pt-[16.727px] px-[16px] relative w-[250px]">
        <Paragraph />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="bg-[#003366] h-[614.545px] relative shrink-0 w-[250px]" data-name="Sidebar">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[614.545px] items-start overflow-clip relative rounded-[inherit] w-[250px]">
        <Container1 />
        <Navigation />
        <Container6 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Heading 1">
      <p className="font-['Arial:Regular',_sans-serif] leading-[32px] not-italic relative shrink-0 text-[24px] text-black text-nowrap whitespace-pre">Sistema de Gestão de Contratos e Suprimentos</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2.27px] whitespace-pre">Administrador e Supervisor - SGCS</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[60px] relative shrink-0 w-[498.636px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[60px] items-start relative w-[498.636px]">
        <Heading1 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Icon17() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[#003366] relative rounded-[2.44032e+07px] shrink-0 size-[32px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[32px]">
        <Icon17 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[14px] text-black text-right">Administrador</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="font-['Arial:Regular',_sans-serif] leading-[16px] not-italic relative shrink-0 text-[#4a5565] text-[12px] text-nowrap text-right whitespace-pre">Gerente de Processos</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow h-[36px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start relative w-full">
        <Paragraph2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute bg-gray-100 box-border content-stretch flex gap-[12px] h-[52px] items-center left-[52px] px-[12px] py-0 rounded-[2.44032e+07px] top-0 w-[182.057px]" data-name="Container">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="absolute left-[8px] size-[20px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p1c3efea0} id="Vector" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p25877f40} id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Button15() {
  return (
    <div className="absolute bg-gray-100 left-0 rounded-[2.44032e+07px] size-[36px] top-0" data-name="Button">
      <Icon18 />
    </div>
  );
}

function Badge() {
  return (
    <div className="absolute bg-[#fb2c36] left-[20px] rounded-[8px] size-[20px] top-[-4px]" data-name="Badge">
      <div className="box-border content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[8.727px] py-[2.727px] relative rounded-[inherit] size-[20px]">
        <p className="font-['Arial:Regular',_sans-serif] leading-[16px] not-italic relative shrink-0 text-[12px] text-nowrap text-white whitespace-pre">3</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute left-0 size-[36px] top-[8px]" data-name="Container">
      <Button15 />
      <Badge />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[52px] relative shrink-0 w-[234.057px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[52px] relative w-[234.057px]">
        <Container10 />
        <Container11 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex h-[60px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container12 />
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[92.727px] relative shrink-0 w-[905.636px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[92.727px] items-start pb-[0.727px] pt-[16px] px-[24px] relative w-[905.636px]">
        <Container13 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[36px] left-0 not-italic text-[30px] text-black text-nowrap top-[-3.18px] whitespace-pre">Penalidades</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[-2.27px] whitespace-pre">Gestão e controle de penalidades contratuais</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[64px] relative shrink-0 w-[318.659px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[64px] items-start relative w-[318.659px]">
        <Heading2 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="absolute left-[12px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33335 8H12.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M8 3.33334V12.6667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button16() {
  return (
    <div className="bg-[#003366] h-[36px] relative rounded-[8px] shrink-0 w-[173.636px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[173.636px]">
        <Icon19 />
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[44px] not-italic text-[14px] text-nowrap text-white top-[6px] whitespace-pre">Aplicar Penalidade</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex h-[64px] items-center justify-between relative w-full">
          <Container14 />
          <Button16 />
        </div>
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[24px] text-black text-center">6</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Ativas</p>
    </div>
  );
}

function Penalidades() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.341px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.341px]">
        <Paragraph5 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-0 p-[0.727px] rounded-[14px] top-0 w-[108.795px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#e7000b] text-[24px] text-center">1</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Aplicadas</p>
    </div>
  );
}

function Penalidades1() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.352px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.352px]">
        <Paragraph7 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[124.8px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades1 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#d08700] text-[24px] text-center">1</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Em Análise</p>
    </div>
  );
}

function Penalidades2() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.352px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.352px]">
        <Paragraph9 />
        <Paragraph10 />
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[249.6px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades2 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#155dfc] text-[24px] text-center">1</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Contestadas</p>
    </div>
  );
}

function Penalidades3() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.352px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.352px]">
        <Paragraph11 />
        <Paragraph12 />
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[374.41px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades3 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="content-stretch flex h-[32px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#9810fa] text-[24px] text-center">2</p>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Vencidas</p>
    </div>
  );
}

function Penalidades4() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.352px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.352px]">
        <Paragraph13 />
        <Paragraph14 />
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[499.22px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades4 />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="content-stretch flex h-[32px] items-start justify-center relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[32px] min-h-px min-w-px not-italic relative shrink-0 text-[#45556c] text-[24px] text-center">0</p>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#4a5565] text-[12px] text-center">Arquivadas</p>
    </div>
  );
}

function Penalidades5() {
  return (
    <div className="h-[52px] relative shrink-0 w-[83.352px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center justify-center relative w-[83.352px]">
        <Paragraph15 />
        <Paragraph16 />
      </div>
    </div>
  );
}

function Card5() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[624.02px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col font-['Arial:Regular',_sans-serif] gap-[5px] items-center justify-center not-italic relative shrink-0 text-center w-[101px]">
      <p className="leading-[32px] min-w-full relative shrink-0 text-[20px] text-black w-[min-content]">R$ 12.500,00</p>
      <p className="leading-[16px] relative shrink-0 text-[#4a5565] text-[12px] w-[83px]">Valor Total Aplicado</p>
    </div>
  );
}

function Penalidades6() {
  return (
    <div className="h-[100px] relative shrink-0" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[100px] items-start relative">
        <Frame1 />
      </div>
    </div>
  );
}

function Card6() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[137.455px] items-center justify-center left-[748.83px] p-[0.727px] rounded-[14px] top-0 w-[108.807px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Penalidades6 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[137.455px] relative shrink-0 w-full" data-name="Container">
      <Card />
      <Card1 />
      <Card2 />
      <Card3 />
      <Card4 />
      <Card5 />
      <Card6 />
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[#f3f3f5] h-[36px] left-0 rounded-[8px] top-0 w-[616.182px]" data-name="Input">
      <div className="box-border content-stretch flex h-[36px] items-center overflow-clip pl-[40px] pr-[12px] py-[4px] relative rounded-[inherit] w-[616.182px]">
        <p className="font-['Arial:Regular',_sans-serif] leading-[normal] not-italic relative shrink-0 text-[#717182] text-[14px] text-nowrap whitespace-pre">Buscar por empresa, processo ou tipo de penalidade...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon20() {
  return (
    <div className="absolute left-[12px] size-[20px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d="M17.5 17.5L13.8833 13.8833" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pcddfd00} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[36px] left-0 top-0 w-[616.182px]" data-name="Container">
      <Input />
      <Icon20 />
    </div>
  );
}

function PrimitiveSpan() {
  return (
    <div className="h-[20px] relative shrink-0 w-[95.841px]" data-name="Primitive.span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center overflow-clip relative rounded-[inherit] w-[95.841px]">
        <p className="font-['Arial:Regular',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Todos os Status</p>
      </div>
    </div>
  );
}

function Icon21() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon" opacity="0.5">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="absolute bg-[#f3f3f5] box-border content-stretch flex h-[36px] items-center justify-between left-[632.18px] px-[12.727px] py-[0.727px] rounded-[8px] top-0 w-[192px]" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <PrimitiveSpan />
      <Icon21 />
    </div>
  );
}

function Penalidades7() {
  return (
    <div className="h-[36px] relative shrink-0 w-[824.182px]" data-name="Penalidades">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[824.182px]">
        <Container17 />
        <PrimitiveButton />
      </div>
    </div>
  );
}

function Card7() {
  return (
    <div className="bg-white h-[77.454px] relative rounded-[14px] shrink-0 w-full" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[77.454px] items-start pb-[0.727px] pl-[16.727px] pr-[0.727px] pt-[16.727px] relative w-full">
          <Penalidades7 />
        </div>
      </div>
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="[grid-area:1_/_1] bg-white h-[29px] relative rounded-[14px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[29px] items-center justify-center px-[8.727px] py-[4.727px] relative w-full">
          <p className="font-['Arial:Regular',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[14px] text-neutral-950 text-nowrap whitespace-pre">Penalidades Ativas (6)</p>
        </div>
      </div>
    </div>
  );
}

function PrimitiveButton2() {
  return (
    <div className="[grid-area:1_/_2] h-[29px] relative rounded-[14px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[6px] h-[29px] items-center justify-center px-[8.727px] py-[4.727px] relative w-full">
          <p className="font-['Arial:Regular',_sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6a7282] text-[14px] text-nowrap whitespace-pre">Arquivadas (0)</p>
        </div>
      </div>
    </div>
  );
}

function TabList() {
  return (
    <div className="bg-[#ececf0] h-[36px] relative rounded-[14px] shrink-0 w-[448px]" data-name="Tab List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[36px] px-[3px] py-[3.5px] relative w-[448px]">
        <PrimitiveButton1 />
        <PrimitiveButton2 />
      </div>
    </div>
  );
}

function CardTitle() {
  return (
    <div className="absolute content-stretch flex h-[28px] items-start left-[24.73px] top-[12.73px] w-[808.182px]" data-name="CardTitle">
      <p className="basis-0 font-['Arial:Regular',_sans-serif] grow leading-[28px] min-h-px min-w-px not-italic relative shrink-0 text-[20px] text-black">Histórico Completo</p>
    </div>
  );
}

function TableHead() {
  return (
    <div className="absolute h-[32px] left-[200px] top-0 w-[120px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Processo</p>
    </div>
  );
}

function TableHead1() {
  return (
    <div className="absolute h-[32px] left-[320px] top-0 w-[227.33px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Penalidade</p>
    </div>
  );
}

function TableHead2() {
  return (
    <div className="absolute h-[32px] left-[547.33px] top-0 w-[120px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Valor</p>
    </div>
  );
}

function TableHead3() {
  return (
    <div className="absolute h-[32px] left-[667.33px] top-0 w-[140px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Status</p>
    </div>
  );
}

function TableHead4() {
  return (
    <div className="absolute h-[32px] left-[807.33px] top-0 w-[140px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Data Ocorrência</p>
    </div>
  );
}

function TableHead5() {
  return (
    <div className="absolute h-[32px] left-[947.33px] top-0 w-[140px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Data Aplicação</p>
    </div>
  );
}

function TableHead6() {
  return (
    <div className="absolute h-[32px] left-[1087.33px] top-0 w-[140px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Tempo de Vigência</p>
    </div>
  );
}

function TableHead7() {
  return (
    <div className="absolute h-[32px] left-[1227.33px] top-0 w-[160px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Responsável</p>
    </div>
  );
}

function TableHead8() {
  return (
    <div className="absolute h-[32px] left-[1387.33px] top-0 w-[100px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Ações</p>
    </div>
  );
}

function TableRow() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableHead />
      <TableHead1 />
      <TableHead2 />
      <TableHead3 />
      <TableHead4 />
      <TableHead5 />
      <TableHead6 />
      <TableHead7 />
      <TableHead8 />
    </div>
  );
}

function TableHeader() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[1487.33px]" data-name="TableHeader">
      <TableRow />
    </div>
  );
}

function TableCell() {
  return (
    <div className="absolute h-[34.182px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">2024-001</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="absolute h-[34.182px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Atraso na entrega</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="absolute h-[34.182px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">R$ 12.500,00</p>
    </div>
  );
}

function Badge1() {
  return (
    <div className="absolute bg-[#ffe2e2] h-[21.454px] left-[8px] rounded-[8px] top-[6.36px] w-[64.421px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[64.421px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#9f0712] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Aplicada</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell3() {
  return (
    <div className="absolute h-[34.182px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge1 />
    </div>
  );
}

function TableCell4() {
  return (
    <div className="absolute h-[34.182px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">15/01/2024</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="absolute h-[34.182px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">20/01/2024</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="absolute h-[34.182px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">1 ano e 8 meses</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="absolute h-[34.182px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Maria Silva</p>
    </div>
  );
}

function TableCell8() {
  return <div className="absolute h-[34.182px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell" />;
}

function TableRow1() {
  return (
    <div className="absolute h-[34.182px] left-0 top-0 w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
      <TableCell8 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="absolute h-[34.182px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">2023-089</p>
    </div>
  );
}

function TableCell10() {
  return (
    <div className="absolute h-[34.182px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Descumprimento de especificação</p>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="absolute h-[34.182px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">R$ 8.900,00</p>
    </div>
  );
}

function Badge2() {
  return (
    <div className="absolute bg-[#fef9c2] h-[21.454px] left-[8px] rounded-[8px] top-[6.36px] w-[76.739px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[76.739px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#894b00] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Em Análise</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="absolute h-[34.182px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge2 />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="absolute h-[34.182px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">12/01/2024</p>
    </div>
  );
}

function TableCell14() {
  return (
    <div className="absolute h-[34.182px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">-</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="absolute h-[34.182px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">1 ano e 9 meses</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="absolute h-[34.182px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">João Santos</p>
    </div>
  );
}

function TableCell17() {
  return <div className="absolute h-[34.182px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell" />;
}

function TableRow2() {
  return (
    <div className="absolute h-[34.182px] left-0 top-[34.18px] w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableCell9 />
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
    </div>
  );
}

function TableCell18() {
  return (
    <div className="absolute h-[34.182px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">2024-003</p>
    </div>
  );
}

function TableCell19() {
  return (
    <div className="absolute h-[34.182px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Abandono de serviço</p>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="absolute h-[34.182px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">R$ 45.200,00</p>
    </div>
  );
}

function Badge3() {
  return (
    <div className="absolute bg-blue-100 h-[21.454px] left-[8px] rounded-[8px] top-[6.36px] w-[78.989px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[78.989px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#193cb8] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Contestada</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell21() {
  return (
    <div className="absolute h-[34.182px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge3 />
    </div>
  );
}

function TableCell22() {
  return (
    <div className="absolute h-[34.182px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">08/01/2024</p>
    </div>
  );
}

function TableCell23() {
  return (
    <div className="absolute h-[34.182px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">10/01/2024</p>
    </div>
  );
}

function TableCell24() {
  return (
    <div className="absolute h-[34.182px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">1 ano e 9 meses</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="absolute h-[34.182px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Ana Costa</p>
    </div>
  );
}

function TableCell26() {
  return <div className="absolute h-[34.182px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell" />;
}

function TableRow3() {
  return (
    <div className="absolute h-[34.182px] left-0 top-[68.36px] w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableCell18 />
      <TableCell19 />
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell23 />
      <TableCell24 />
      <TableCell25 />
      <TableCell26 />
    </div>
  );
}

function TableCell27() {
  return (
    <div className="absolute h-[34.182px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">2024-004</p>
    </div>
  );
}

function TableCell28() {
  return (
    <div className="absolute h-[34.182px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Produto fora de especificação</p>
    </div>
  );
}

function TableCell29() {
  return (
    <div className="absolute h-[34.182px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">R$ 21.000,00</p>
    </div>
  );
}

function Badge4() {
  return (
    <div className="absolute bg-gray-100 h-[21.454px] left-[8px] rounded-[8px] top-[6.36px] w-[68.216px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[68.216px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#1e2939] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Suspensa</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell30() {
  return (
    <div className="absolute h-[34.182px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge4 />
    </div>
  );
}

function TableCell31() {
  return (
    <div className="absolute h-[34.182px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">05/01/2024</p>
    </div>
  );
}

function TableCell32() {
  return (
    <div className="absolute h-[34.182px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">07/01/2024</p>
    </div>
  );
}

function TableCell33() {
  return (
    <div className="absolute h-[34.182px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">1 ano e 9 meses</p>
    </div>
  );
}

function TableCell34() {
  return (
    <div className="absolute h-[34.182px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[5.09px] whitespace-pre">Carlos Oliveira</p>
    </div>
  );
}

function TableCell35() {
  return <div className="absolute h-[34.182px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell" />;
}

function TableRow4() {
  return (
    <div className="absolute h-[34.182px] left-0 top-[102.55px] w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableCell27 />
      <TableCell28 />
      <TableCell29 />
      <TableCell30 />
      <TableCell31 />
      <TableCell32 />
      <TableCell33 />
      <TableCell34 />
      <TableCell35 />
    </div>
  );
}

function TableCell36() {
  return (
    <div className="absolute h-[44.727px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">2023-075</p>
    </div>
  );
}

function TableCell37() {
  return (
    <div className="absolute h-[44.727px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">Atraso na entrega</p>
    </div>
  );
}

function TableCell38() {
  return (
    <div className="absolute h-[44.727px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">R$ 15.300,00</p>
    </div>
  );
}

function Badge5() {
  return (
    <div className="absolute bg-purple-100 h-[21.454px] left-[8px] rounded-[8px] top-[11.64px] w-[60.045px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[60.045px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#6e11b0] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Vencida</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell39() {
  return (
    <div className="absolute h-[44.727px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge5 />
    </div>
  );
}

function TableCell40() {
  return (
    <div className="absolute h-[44.727px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">10/12/2023</p>
    </div>
  );
}

function TableCell41() {
  return (
    <div className="absolute h-[44.727px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">15/12/2023</p>
    </div>
  );
}

function TableCell42() {
  return (
    <div className="absolute h-[44.727px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">1 ano e 10 meses</p>
    </div>
  );
}

function TableCell43() {
  return (
    <div className="absolute h-[44.727px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">Pedro Alves</p>
    </div>
  );
}

function Icon22() {
  return (
    <div className="absolute left-[10.73px] size-[16px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p7ec0480} id="Vector" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p36c0b900} id="Vector_2" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6.66667 8H9.33333" id="Vector_3" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button17() {
  return (
    <div className="absolute bg-white h-[32px] left-[8px] rounded-[8px] top-[6.36px] w-[37.455px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#dab2ff] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon22 />
    </div>
  );
}

function TableCell44() {
  return (
    <div className="absolute h-[44.727px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell">
      <Button17 />
    </div>
  );
}

function TableRow5() {
  return (
    <div className="absolute h-[44.727px] left-0 top-[136.73px] w-[1487.33px]" data-name="TableRow">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.727px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none" />
      <TableCell36 />
      <TableCell37 />
      <TableCell38 />
      <TableCell39 />
      <TableCell40 />
      <TableCell41 />
      <TableCell42 />
      <TableCell43 />
      <TableCell44 />
    </div>
  );
}

function TableCell45() {
  return (
    <div className="absolute h-[44.364px] left-[200px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">2023-082</p>
    </div>
  );
}

function TableCell46() {
  return (
    <div className="absolute h-[44.364px] left-[320px] top-0 w-[227.33px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">Produto fora de especificação</p>
    </div>
  );
}

function TableCell47() {
  return (
    <div className="absolute h-[44.364px] left-[547.33px] top-0 w-[120px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">R$ 9.800,00</p>
    </div>
  );
}

function Badge6() {
  return (
    <div className="absolute bg-purple-100 h-[21.454px] left-[8px] rounded-[8px] top-[11.64px] w-[60.045px]" data-name="Badge">
      <div className="h-[21.454px] overflow-clip relative rounded-[inherit] w-[60.045px]">
        <p className="absolute font-['Arial:Regular',_sans-serif] leading-[16px] left-[8.73px] not-italic text-[#6e11b0] text-[12px] text-nowrap top-[1.73px] whitespace-pre">Vencida</p>
      </div>
      <div aria-hidden="true" className="absolute border-[0.727px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TableCell48() {
  return (
    <div className="absolute h-[44.364px] left-[667.33px] top-0 w-[140px]" data-name="TableCell">
      <Badge6 />
    </div>
  );
}

function TableCell49() {
  return (
    <div className="absolute h-[44.364px] left-[807.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">20/11/2023</p>
    </div>
  );
}

function TableCell50() {
  return (
    <div className="absolute h-[44.364px] left-[947.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">25/11/2023</p>
    </div>
  );
}

function TableCell51() {
  return (
    <div className="absolute h-[44.364px] left-[1087.33px] top-0 w-[140px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">1 ano e 10 meses</p>
    </div>
  );
}

function TableCell52() {
  return (
    <div className="absolute h-[44.364px] left-[1227.33px] top-0 w-[160px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[#4a5565] text-[14px] text-nowrap top-[10.36px] whitespace-pre">Fernanda Lima</p>
    </div>
  );
}

function Icon23() {
  return (
    <div className="absolute left-[10.73px] size-[16px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p7ec0480} id="Vector" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p36c0b900} id="Vector_2" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M6.66667 8H9.33333" id="Vector_3" stroke="var(--stroke-0, #9810FA)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button18() {
  return (
    <div className="absolute bg-white h-[32px] left-[8px] rounded-[8px] top-[6.36px] w-[37.455px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#dab2ff] border-[0.727px] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Icon23 />
    </div>
  );
}

function TableCell53() {
  return (
    <div className="absolute h-[44.364px] left-[1387.33px] top-0 w-[100px]" data-name="TableCell">
      <Button18 />
    </div>
  );
}

function TableRow6() {
  return (
    <div className="absolute h-[44.364px] left-0 top-[181.46px] w-[1487.33px]" data-name="TableRow">
      <TableCell45 />
      <TableCell46 />
      <TableCell47 />
      <TableCell48 />
      <TableCell49 />
      <TableCell50 />
      <TableCell51 />
      <TableCell52 />
      <TableCell53 />
    </div>
  );
}

function TableBody() {
  return (
    <div className="absolute h-[225.818px] left-0 top-[32px] w-[1487.33px]" data-name="TableBody">
      <TableRow1 />
      <TableRow2 />
      <TableRow3 />
      <TableRow4 />
      <TableRow5 />
      <TableRow6 />
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[257.818px] left-0 top-0 w-[1487.33px]" data-name="Table">
      <TableHeader />
      <TableBody />
    </div>
  );
}

function TableHead9() {
  return (
    <div className="absolute bg-white h-[32px] left-0 top-0 w-[200px]" data-name="TableHead">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-neutral-950 text-nowrap top-[3.82px] whitespace-pre">Empresa</p>
    </div>
  );
}

function TableCell54() {
  return (
    <div className="absolute bg-white h-[34.182px] left-0 top-[32px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">Empresa ABC Ltda</p>
    </div>
  );
}

function TableCell55() {
  return (
    <div className="absolute bg-white h-[34.182px] left-0 top-[66.18px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">Fornecedor XYZ S.A</p>
    </div>
  );
}

function TableCell56() {
  return (
    <div className="absolute bg-white h-[34.182px] left-0 top-[100.36px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">Serviços DEF Eireli</p>
    </div>
  );
}

function TableCell57() {
  return (
    <div className="absolute bg-white h-[34.182px] left-0 top-[134.54px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[5.09px] whitespace-pre">Tecnologia GHI Ltda</p>
    </div>
  );
}

function TableCell58() {
  return (
    <div className="absolute bg-white h-[44.727px] left-0 top-[168.73px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">Comércio JKL Ltda</p>
    </div>
  );
}

function TableCell59() {
  return (
    <div className="absolute bg-white h-[44.364px] left-0 top-[213.46px] w-[200px]" data-name="TableCell">
      <p className="absolute font-['Arial:Regular',_sans-serif] leading-[20px] left-[8px] not-italic text-[14px] text-black text-nowrap top-[10.36px] whitespace-pre">Distribuidora MNO S.A</p>
    </div>
  );
}

function Table1() {
  return (
    <div className="h-[257.818px] overflow-clip relative shrink-0 w-full" data-name="Table">
      <Table />
      <TableHead9 />
      <TableCell54 />
      <TableCell55 />
      <TableCell56 />
      <TableCell57 />
      <TableCell58 />
      <TableCell59 />
    </div>
  );
}

function Penalidades8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[257.818px] items-start left-[16.73px] overflow-clip top-[90.73px] w-[824.182px]" data-name="Penalidades">
      <Table1 />
    </div>
  );
}

function Card8() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[14px] shrink-0 w-[857.636px]" data-name="Card">
      <div aria-hidden="true" className="absolute border-[0.727px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[857.636px]">
        <CardTitle />
        <Penalidades8 />
      </div>
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[417.273px] items-start relative shrink-0 w-full" data-name="Primitive.div">
      <TabList />
      <Card8 />
    </div>
  );
}

function Penalidades9() {
  return (
    <div className="h-[816.182px] relative shrink-0 w-full" data-name="Penalidades">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] h-[816.182px] items-start pb-0 pt-[24px] px-[24px] relative w-full">
          <Container15 />
          <Container16 />
          <Card7 />
          <PrimitiveDiv />
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[905.636px]" data-name="Main Content">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start overflow-clip relative rounded-[inherit] w-[905.636px]">
        <Penalidades9 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 grow h-[614.545px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[614.545px] items-start relative w-full">
        <Header />
        <MainContent />
      </div>
    </div>
  );
}

export default function SescAdministradorManuela() {
  return (
    <div className="bg-white content-stretch flex items-start relative size-full" data-name="SESC | Administrador [Manuela]">
      <Sidebar />
      <Container18 />
    </div>
  );
}