import PitchLogo from '../../../public/images/PitchLogoBlack.png';
export default function TestimonialSection() {
  return (
    <section className='bg-white py-24'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2'>
          <div className='flex flex-col pb-10 sm:pb-16 lg:pb-0 lg:pr-8 xl:pr-20'>
            <img
              className='h-8 self-start'
              src='https://global-uploads.webflow.com/59ace8427353c50001765cbd/613a93a8e073f3860d5cfbcc_logo-nav.svg'
              alt=''
            />
            <figure className='mt-10 flex flex-auto flex-col justify-between'>
              <blockquote className='text-lg leading-8 text-gray-900'>
                <p>
                  “Research at its core is learning. The more research you do
                  and the faster you learn, the faster your decision-making will
                  be.”
                </p>
              </blockquote>
              <figcaption className='mt-10 flex items-center gap-x-6'>
                <img
                  className='h-14 w-14 rounded-full bg-gray-50'
                  src='https://www.datocms-assets.com/38511/1669630232-roberta-dombrowski.png?auto=format&dpr=1&w=480'
                  alt=''
                />
                <div className='text-base'>
                  <a
                    className='border-b border-gray-900 font-semibold text-gray-900'
                    href='https://www.linkedin.com/in/robertadombrowski/'
                    target='_blank'
                  >
                    Roberta Dombrowski
                  </a>
                  <div className='mt-1 text-gray-500'>
                    VP of User Research at User Interviews
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className='flex flex-col border-t border-gray-900/10 pt-10 sm:pt-16 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-20'>
            <img className='h-8 self-start' src={PitchLogo.src} alt='' />
            <figure className='mt-10 flex flex-auto flex-col justify-between'>
              <blockquote className='text-lg leading-8 text-gray-900'>
                <p>
                  “Once you have more insights on a certain topic and more
                  information about the pros and cons of the options you&apos;re
                  facing, there&apos;s a higher chance that the whole team knows more
                  and has higher confidence in decision-making.”
                </p>
              </blockquote>
              <figcaption className='mt-10 flex items-center gap-x-6'>
                <img
                  className='h-14 w-14 rounded-full bg-gray-50'
                  src='https://www.datocms-assets.com/38511/1669630273-xiangyi-tang-violet.png?auto=format&dpr=1&w=480'
                  alt=''
                />
                <div className='text-base'>
                  <a
                    className='border-b border-gray-900 font-semibold text-gray-900'
                    href='https://www.linkedin.com/in/xiangyi-tang-5552b91b/'
                    target='_blank'
                  >
                    Xiangyi Tang
                  </a>
                  <div className='mt-1 text-gray-500'>
                    Head of User Research at Pitch
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
