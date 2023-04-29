import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Loading, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';
const Mint = () => {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        // Hydrate Arwes components on client-side
        setHydrated(true);
    }, []);
    const [audio3] = useState<HTMLAudioElement | undefined>(
        typeof Audio !== "undefined" ? new Audio("sounds/ask.mp3") : undefined
    );
    const start = () => {
        audio3?.play()
    }
    return (
        <>

            <ThemeProvider theme={createTheme()}>
                {hydrated ? (
                    <Arwes animate show background='background.jpg' pattern='glow.png'>


                        <div className="container">
                            <div className="row mx-0 mt-5 pt-5">
                                <div className="col-lg-3"></div>
                                <div className="col-lg-6">
                                    <div className="d-flex justify-content-center">
                                        <img src="/NEXUS.png" alt="" className='img-fluid' />
                                    </div>
                                    <div className="d-flex mt-4  justify-content-center gap-2">
                                        <i className='fa-brands fa-twitter fs-5 text-white'></i>
                                        <i className='fa-brands fa-discord fs-5 text-white'></i>
                                    </div>
                                    <Heading node="h2" className="text-center mt-4">
                                        The Nexus Ethreals Contract
                                        <br />
                                        LEARN TO BRIDGE TO EXRP

                                    </Heading>
                                    <Paragraph className="text-center">
                                        Nexus Ethereals cost 333 eXRP
                                    </Paragraph>
                                    <div className="text-center">
                                        <Button layer="alert">
                                            Connect to the nexus core
                                        </Button>
                                    </div>
                                    <div className="d-flex justify-content-center my-4">
                                        <Loading></Loading>
                                    </div>
                                    <Heading node="h2" className="text-center my-2">
                                        SEE YOUR NEXUS ETHEREALS
                                     

                                    </Heading>
                                    <div className="d-flex justify-content-center">
                                        <img src="/preview.gif" alt="" className="img-fluid" />
                                    </div>
                                </div>
                                <div className="col-lg-3"></div>
                            </div>
                        </div>
                    </Arwes>
                ) : (
                    <div>
                        <p>Loading... Please Wait</p>
                    </div>
                )}
            </ThemeProvider>
        </>
    )
}

export default Mint