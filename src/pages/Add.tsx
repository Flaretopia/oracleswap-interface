import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';
import Header from '@/components/Header';

const Add = () => {

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
                                        {"View Liquidity Positions >"}
                                    </Link>

                                    <div className="mt-4">
                                        <Frame

                                            animate={true}
                                            level={3}
                                            corners={4}
                                            layer='primary'
                                            id="myToast"
                                        >
                                            <div style={{ padding: '20px 40px', fontSize: '32px' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-4 ">
                                                    <Button node="h6" layer="success" onClick={start}>Liquidity </Button>
                                                    <button className='bg-transparent border-0 p-0 text-white m-0' ><i className='fa-solid fa-cog h6'></i>
                                                    </button>

                                                </div>
                                                <Frame animate={true}
                                                    level={3}
                                                    corners={4}
                                                    layer='primary' >
                                                    <div className="d-flex justify-content-between align-items-center py-2 px-3 flex-wrap gap-lg-0 gap-4 pb-lg-0 pb-4">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div>
                                                                <img src="xrp.png" className='img-xrp' alt="" />
                                                            </div>
                                                            <div className='d-flex flex-column gap-2'>
                                                                <p className="text-white-50 mb-0 fs-6">Input</p>
                                                                <Heading node="h5" className="mb-0"> XRP <i className='fa fa-angle-down'></i></Heading>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Frame className="" animate={true}
                                                                level={1}
                                                                corners={4}
                                                                layer='primary' >
                                                                <input type="text" placeholder='0.0' style={{ outline: "none", fontSize: "19px" }} className="w-100 text-start px-3  bg-transparent border-0 p-0 text-white" />
                                                            </Frame>
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
                                                    <div className="d-flex justify-content-between align-items-center py-2 px-3 flex-wrap gap-lg-0 gap-4 pb-lg-0 pb-4">
                                                        <div className="d-flex gap-3 align-items-center">
                                                            <div>
                                                                <img src="nexu.png" className='img-xrp' alt="" />
                                                            </div>
                                                            <div className='d-flex flex-column gap-2'>
                                                                <p className="text-white-50 mb-0 fs-6">Input</p>
                                                                <Heading node="h5" className="mb-0"> NEXU <i className='fa fa-angle-down'></i></Heading>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Frame className="" animate={true}
                                                                level={1}
                                                                corners={4}
                                                                layer='primary' >
                                                                <input type="text" placeholder='0.0' style={{ outline: "none", fontSize: "19px" }} className="w-100 text-start px-3  bg-transparent border-0 p-0 text-white" />
                                                            </Frame>
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
                                                <Button onClick={start} className="mt-4 w-100 text-center py-3">
                                                    Connect
                                                </Button>
                                            </div>
                                        </Frame>

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

export default Add