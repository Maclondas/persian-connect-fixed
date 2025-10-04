import { useLanguage } from './hooks/useLanguage';
import svgPaths from '../imports/svg-im5jbcflav';

interface SupportInformationPageProps {
  onNavigate: (page: any) => void;
}

// Arrow icons components
function BackArrowIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_12_860)">
          <path clipRule="evenodd" d={svgPaths.p242cebf0} fill="var(--fill-0, white)" fillRule="evenodd" />
        </g>
        <defs>
          <clipPath id="clip0_12_860">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_51_519)">
          <path clipRule="evenodd" d={svgPaths.p6ff4e00} fill="var(--fill-0, white)" fillRule="evenodd" />
        </g>
        <defs>
          <clipPath id="clip0_51_519">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

// Menu item component
function MenuItem({ title, onClick }: { title: string; onClick?: () => void }) {
  return (
    <div className="bg-[#1a1a1a] h-[56px] min-h-[56px] relative shrink-0 w-full cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={onClick}>
      <div className="flex flex-row items-center min-h-inherit relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[56px] items-center justify-between min-h-inherit px-[16px] py-0 relative w-full">
          <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start overflow-clip relative w-full">
              <div className="css-7se0s3 font-['Manrope:Regular',_sans-serif] font-normal leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-nowrap text-white w-full">
                <p className="leading-[24px] overflow-ellipsis overflow-hidden whitespace-pre">{title}</p>
              </div>
            </div>
          </div>
          <div className="relative shrink-0">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative">
              <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[28px]">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center justify-center relative w-[28px]">
                  <ChevronRightIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupportInformationPage({ onNavigate }: SupportInformationPageProps) {
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { title: 'Support' },
    { title: 'User Guide' },
    { title: 'Terms & Conditions' },
    { title: 'About Us' },
    { title: 'Security & Safety' },
    { title: 'Privacy' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#1a1a1a] relative shrink-0 w-full">
        <div className="flex flex-row items-center relative size-full">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-between pb-[8px] pt-[16px] px-[16px] relative w-full">
            {/* Back button */}
            <div className="relative shrink-0 size-[48px] cursor-pointer hover:bg-[#2a2a2a] rounded-lg transition-colors flex items-center justify-center" onClick={() => onNavigate('home')}>
              <BackArrowIcon />
            </div>
            
            {/* Title */}
            <div className="basis-0 grow h-[23px] min-h-px min-w-px relative shrink-0">
              <div className="flex flex-col items-center relative size-full">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[23px] items-center pl-0 pr-[48px] py-0 relative w-full">
                  <div className="css-ddnua5 font-['Manrope:Bold',_sans-serif] font-bold leading-[0] relative shrink-0 text-[18px] text-center text-nowrap text-white w-full">
                    <p className="leading-[23px] whitespace-pre">Support & Information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="relative shrink-0 w-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative w-full">
          {menuItems.map((item, index) => (
            <MenuItem 
              key={index}
              title={item.title}
              onClick={() => {
                if (item.title === 'Terms & Conditions') {
                  onNavigate('terms-conditions');
                } else if (item.title === 'Security & Safety') {
                  onNavigate('security-safety');
                } else if (item.title === 'User Guide') {
                  onNavigate('user-guide');
                } else if (item.title === 'About Us') {
                  onNavigate('about-us');
                } else if (item.title === 'Privacy') {
                  onNavigate('privacy');
                } else {
                  // You can add specific navigation logic for other menu items here
                  console.log(`Clicked: ${item.title}`);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="bg-[#1a1a1a] h-[20px] relative shrink-0 w-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] w-full" />
      </div>
    </div>
  );
}