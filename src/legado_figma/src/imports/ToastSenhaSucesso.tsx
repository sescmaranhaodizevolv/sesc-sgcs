import svgPaths from "./svg-vfojpap4mb";

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex flex-row items-center self-stretch">
        <div className="flex h-full items-center justify-center relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "20", "--transform-inner-height": "19.59375" } as React.CSSProperties}>
          <div className="flex-none h-full rotate-[90deg]">
            <div className="h-full relative w-[20px]">
              <div className="absolute inset-[-0.5px_-2.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 1">
                  <path d="M0.5 0.5H20.5" id="Line 257" stroke="var(--stroke-0, white)" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[14px] text-white w-[252px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Sucesso
      </p>
    </div>
  );
}

function Content() {
  return (
    <div className="basis-0 content-stretch flex grow items-center justify-between min-h-px min-w-px relative shrink-0" data-name="Content">
      <Frame />
      <div className="relative shrink-0 size-[8.825px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
          <path d={svgPaths.p1d380c00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function ToastSenhaSucesso() {
  return (
    <div className="bg-[#00a63e] relative rounded-[8px] shadow-[0px_0px_0px_0px_rgba(0,0,0,0)] size-full" data-name="Toast - Senha sucesso">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center px-[16px] py-[10px] relative size-full">
          <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Icon Approved">
            <div className="absolute inset-[12.5%]" data-name="Vector">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                <path clipRule="evenodd" d={svgPaths.p36b9b880} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
              </svg>
            </div>
          </div>
          <Content />
        </div>
      </div>
    </div>
  );
}