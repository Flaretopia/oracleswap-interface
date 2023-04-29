import React from 'react'
import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Loading, Button, List, Link, Heading, Paragraph, createTheme } from 'arwes';

import Header from '@/components/Header';



const Farms = () => {
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

                                <div className="col-lg-12">
                                    <Frame className="mt-3 " animate={true}
                                        level={1}
                                        corners={4}
                                        layer='primary' >
                                        <div className="d-flex gap-3 py-3 w-100 ps-3 align-items-center">
                                            <i className='fa-solid text-white fa-search'></i>
                                            <input type="text" placeholder='Search by token or pair' style={{ outline: "none", fontSize: "19px" }} className="w-100 text-start  bg-transparent border-0 p-0 m-0 text-white" />
                                        </div>

                                    </Frame>
                                    <div className='overflow_control'>
                                        <div className="" style={{ minWidth: "660px" }}>
                                            <Frame className="mt-5" animate={true}
                                                level={1}
                                                corners={4}
                                                layer='primary' >

                                                <div className="row flex-nowrap mx-0 py-3">
                                                    <div className="col-5">
                                                        <div className="text-start">
                                                            <Paragraph className="mb-0">Pool</Paragraph>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-start">
                                                            <Paragraph className="mb-0">TVL</Paragraph>
                                                        </div>
                                                    </div>
                                                    <div className="col-2">
                                                        <div className="text-start">
                                                            <Paragraph className="mb-0">Rewards</Paragraph>
                                                        </div>
                                                    </div>
                                                    <div className="col-2">
                                                        <div className="text-end">
                                                            <Paragraph className="mb-0">Apr</Paragraph>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Frame>
                                            <Frame className="mt-0" animate={true}
                                                level={1}
                                                corners={4}
                                                layer='primary' >

                                                <div className="row flex-nowrap mx-0 py-3">
                                                    <div className="col-5">
                                                        <div className="text-start d-flex align-items-center">
                                                            <img src="xrp2.png" className='xrp2' alt="" />
                                                            <div className="">
                                                                <Heading node="h5" className="mb-0">NEXU / WXRP</Heading>
                                                                <Paragraph className=" mb-0" style={{ fontSize: "12px" }}>Nexus Generator</Paragraph>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-start">
                                                            <Paragraph className="mb-0">51,547</Paragraph>

                                                        </div>
                                                    </div>
                                                    <div className="col-2">
                                                        <div className="text-start d-flex gap-1 ">
                                                            <Paragraph className="mb-0">172,800</Paragraph>
                                                            <img src="nexus22.png" className='xrp3' alt="" />
                                                        </div>
                                                    </div>
                                                    <div className="col-2">
                                                        <div className="text-end d-flex flex-column justify-content-end">
                                                            <Heading className="mb-0" node="h6">-</Heading>
                                                            <Paragraph className="mb-0 " style={{ fontSize: "12px" }}>Annualized</Paragraph>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Frame>
                                        </div>
                                    </div>
                                </div>

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

export default Farms