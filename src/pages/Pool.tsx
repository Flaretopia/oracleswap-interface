import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';
import Header from '@/components/Header';
const Pool = () => {
    const [isHidden, setIsHidden] = useState(false);

    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        // Hydrate Arwes components on client-side
        setHydrated(true);
    }, []);

// const [audio3] = useState(typeof Audio !== "undefined" && new Audio("/sounds/ask.mp3"));
const [audio3] = useState<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("sounds/ask.mp3") : undefined
);

// let audio3 = new Audio("/sounds/ask.mp3")


// let audio3 = new Audio("/sounds/ask.mp3")
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
                                    {isHidden ? null :  <Frame
                                           
                                           animate={true}
                                           level={3}
                                           corners={4}
                                           layer='primary'
                                           id="myToast"
                                       >
                                           <div style={{ padding: '20px 40px', fontSize: '32px' }}>
                                           <div className="d-flex justify-content-between">
                                           <Heading node="h6">Liquidity Provider Rewards</Heading>
                                           <Link node="h6" className="h6" onClick={() => setIsHidden(true)}>
                                               X
                                           </Link>
                                           </div>
                                           <Paragraph className="h6 mb-0">
                                           Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity

                                           </Paragraph>

                                           </div>
                                       </Frame>}
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

export default Pool