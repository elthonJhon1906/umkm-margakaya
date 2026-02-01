'use client'

import { Toaster } from "sonner";

const ToasterProvider = ({children}: {children: React.ReactNode}) => {
    return(
        <>
        {children}
        <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
        duration={5000}
        />
        </>
    )
}

export default ToasterProvider;