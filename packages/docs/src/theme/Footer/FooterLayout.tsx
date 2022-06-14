 import React from 'react';
 import clsx from 'clsx';
 import type {Props} from '@theme/Footer/Layout';
 import styles from './index.module.scss';
 
 export default function FooterLayout({
   style,
   links,
   logo,
   copyright,
 }: Props): JSX.Element {
   return (
     <footer
       className={clsx('footer', {
         'footer--dark': style === 'dark',
       })}>
       <div className="container container-fluid">
          {logo && <div className={clsx('margin-bottom--lg', styles.logoRow)}>{logo}</div>}
          {links}
          {copyright && (
           <div className="footer__bottom text--center">
             {copyright}
           </div>
         )}
       </div>
     </footer>
   );
 }
 