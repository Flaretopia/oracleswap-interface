import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Loading, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';

import Header from '@/components/Header';




const Stake = () => {
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
                        <Header activeClass="1" />

                        <div className="container">
                            <div className="row mx-0 mt-5 pt-5">
                                <div className="col-lg-3"></div>
                                <div className="col-lg-6">
                                    <Link href="/">
                                        {"< Go Back"}
                                    </Link>
                                    <Heading className="mt-4">
                                        My Liquidity Positions
                                    </Heading>
                                    <div className="mt-4">
                                  
                                       <Button onClick={start} className="mt-4">
                                        Connect
                                       </Button>
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

export default Stake