import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode,
  title: string;
  subtitle?: string;
};

const Step = ({ children, title, subtitle }: Props) => {
  return (
    <>
      <h2>{title}</h2>
      {subtitle && <h3>{subtitle}</h3>}
      {children}
    </>
  )
}

export default Step
