import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Loading , Frame, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';
import Header from '@/components/Header';


const Import = () => {
    const [hydrated, setHydrated] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        // Hydrate Arwes components on client-side
        setHydrated(true);
    }, []);
    // const [audio3] = useState(typeof Audio !== "undefined" && new Audio("/sounds/ask.mp3"));
    const [audio3] = useState<HTMLAudioElement | undefined>(
        typeof Audio !== "undefined" ? new Audio("sounds/ask.mp3") : undefined
      );

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
                                <div className="col-lg-2"></div>
                                <div className="col-lg-8">
                                    <Link href="/">
                                        {"< Go Back"}
                                    </Link>
                                    <Heading className="mt-4">
                                    Import Pool

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
                                           <Paragraph node="h6" style={{fontSize:"16px"}} className="mb-0">Tip: Use this tool to find pairs that don't automatically appear in the interface</Paragraph>
                                           <Link node="h6" className="h6" onClick={() => {setIsHidden(true); start; }}>
                                               X
                                           </Link>
                                           </div>
                                          

                                           </div>
                                       </Frame>}
                                       <div className="mt-4">
                                        <Frame

                                            animate={true}
                                            level={3}
                                            corners={4}
                                            layer='primary'
                                            id="myToast"
                                        >
                                            <div style={{ padding: '20px 40px', fontSize: '32px' }}>
                                                
                                                <Frame animate={true}
                                                    level={3}
                                                    corners={4}
                                                    layer='primary' >
                                                    <div className="d-flex justify-content-between align-items-center py-2 px-3">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div>
                                                                <img src="xrp.png" className='img-xrp' alt="" />
                                                            </div>
                                                            <div className='d-flex flex-column gap-2'>
                                                                <p className="text-white-50 mb-0 fs-6">Input</p>
                                                                <Heading node="h5" className="mb-0"> XRP <i className='fa fa-angle-down'></i></Heading>
                                                            </div>
                                                        </div>
                                                       
                                                    </div>
                                                </Frame>
                                                <Frame animate={true}
                                                    level={3}
                                                    corners={4}
                                                    layer='primary'
                                                    className="d-flex justify-content-center align-items-center my-3"
                                                    style={{ width: "max-content" }}
                                                >

                                                    <Heading className="mb-0 py-2 ">
                                                        <i className='fa fa-plus px-3'></i>
                                                    </Heading>
                                                </Frame>
                                                <Frame animate={true}
                                                    level={3}
                                                    corners={4}
                                                    layer='primary' >
                                                    <div className="d-flex justify-content-between align-items-center py-2 px-3">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div>
                                                                {/* <img src="nexu.png" className='img-xrp' alt="" /> */}
                                                                <Loading animate  style={{width:"50px"}} />
                                                            </div>
                                                            <div className='d-flex flex-column gap-2'>
                                                                {/* <p className="text-white-50 mb-0 fs-6">Input</p> */}
                                                                <Heading node="h5" className="mb-0"> Select Token <i className='fa fa-angle-down'></i></Heading>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                </Frame>
                                                <Frame animate={true}
                                                    level={3}
                                                    corners={4}
                                                    layer='primary'
                                                    className="mt-3"
                                                >
                                                    <div className="d-flex justify-content-between align-items-center py-2 px-3 ">
                                                        <div className="">
                                                            <Paragraph className="mb-0" style={{ fontSize: "16px" }}>
                                                                8.746343 per XRP
                                                            </Paragraph>
                                                        </div>
                                                        <div>
                                                            <Paragraph className="mb-0" style={{ fontSize: "16px" }}>
                                                                0%
                                                            </Paragraph>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center  px-3 py-2">
                                                        <div className="">
                                                            <Paragraph className="mb-0" style={{ fontSize: "16px" }}>
                                                                8.746343 per XRP
                                                            </Paragraph>
                                                        </div>
                                                        <div>
                                                            <Paragraph className="mb-0" style={{ fontSize: "16px" }}>
                                                                0%
                                                            </Paragraph>
                                                        </div>
                                                    </div>
                                                </Frame>
                                                <Button onClick={start} className="mt-4 w-100 text-center text-white py-3">
                                                    Connect
                                                </Button>
                                            </div>
                                        </Frame>

                                    </div>
                                    </div>
                                </div>
                                <div className="col-lg-2"></div>
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

export default Import