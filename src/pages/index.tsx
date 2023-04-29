import { useEffect, useState } from 'react';


// import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'


// import { ThemeProvider, Frame , createTheme, Arwes, Button } from 'arwes';
// @ts-ignore: Unreachable code error

import { Arwes, ThemeProvider, Frame, Button, List, Heading, Paragraph, createTheme } from 'arwes';
import Header from '@/components/Header';
// import 'arwes/css/arwes.css';




// const inter = Inter({ subsets: ['latin'] })



export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Hydrate Arwes components on client-side
    setHydrated(true);
  }, []);
  return (
    <>

      <ThemeProvider theme={createTheme()}>
        {hydrated ? (
          <Arwes animate show background='background.jpg' pattern='glow.png'>
            <Header activeClass="0" />
            <div className="container">
              <div className="row align-items-center mx-0 mt-5 pt-5">
                <div className="col-lg-6">
                  <Heading  > Lorem Ipsum is a  <span >dummy text</span></Heading>
                  <Paragraph>Futuristic Sci-Fi and Cyberpunk Graphical User Interface Framework for Web Apps</Paragraph>

                </div>
                <div className="col-lg-6">
                  <div className="d-flex justify-content-center">
                    <img src="NEXUS.png" alt="" className="img-fluid" />
                  </div>
                </div>
              </div>
            </div>
            <div className="container mt-5 pt-5">
              <div className="row mx-0 mb-5 align-items-end gap-md-0 gap-4">
                <div className="col-lg-8">
                  <Heading  > Swap</Heading>

                  <Frame

                    animate={true}
                    level={1}
                    corners={4}
                    layer='primary'
                  >
                    <div style={{ padding: '30px 30px', fontSize: '32px' }}>
                      <div className="d-flex justify-content-between px-0 ">
                        <Paragraph className='text-white mb-0' style={{ fontSize: "14px" }}>From: --</Paragraph>
                        <Paragraph className='text-white mb-0' style={{ fontSize: "14px" }}>
                          <div className=" dropdown">
                            <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Select Token
                            </a>
                            <ul className="dropdown-menu text-center  bg-transparent animate slide2  " aria-labelledby="navbarDropdownMenuLink">
                            <Frame animate={true}
                                           level={3}
                                           corners={4}
                                           layer='primary'>
                                    <li><a className="dropdown-item" href="/Pool">Browse</a></li>
                                    <li><a className="dropdown-item" href="#">Add</a></li>
                                    <li><a className="dropdown-item" href="#">Import</a></li>
                                    </Frame>
                            </ul>
                          </div>

                        </Paragraph>
                      </div>
                      <Frame className="mt-3 px-3" animate={true}
                        level={1}
                        corners={4}
                        layer='primary' >
                        <input type="text" placeholder='0.0' style={{ outline: "none", fontSize: "19px" }} className="w-100 text-center  bg-transparent border-0 p-0 text-white" />

                      </Frame>
                      <Paragraph className='text-white mt-3 ' style={{ fontSize: "14px" }}>Balance: 0.00 Max</Paragraph>

                      <div className="d-flex justify-content-center my-4">
                        <img src="arrow.png" alt="" className="img-fluid" />
                      </div>
                      <div className="d-flex justify-content-between px-0 ">
                        <Paragraph className='text-white mb-0' style={{ fontSize: "14px" }}>From: --</Paragraph>
                        <Paragraph className='text-white mb-0' style={{ fontSize: "14px" }}>
                          <div className=" dropdown">
                            <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Select Token
                            </a>
                            <ul className="dropdown-menu text-center  bg-transparent animate slide2  " aria-labelledby="navbarDropdownMenuLink">
                            <Frame animate={true}
                                           level={3}
                                           corners={4}
                                           layer='primary'>
                                    <li><a className="dropdown-item" href="/Pool">Browse</a></li>
                                    <li><a className="dropdown-item" href="#">Add</a></li>
                                    <li><a className="dropdown-item" href="#">Import</a></li>
                                    </Frame>
                            </ul>
                          </div>

                        </Paragraph>
                      </div>
                      <Frame className="mt-3 px-3" animate={true}
                        level={1}
                        corners={4}
                        layer='primary' >
                        <input type="text" placeholder='0.0' style={{ outline: "none", fontSize: "19px" }} className="w-100 text-center  bg-transparent border-0 p-0 text-white" />

                      </Frame>
                      <Paragraph className='text-white mt-3 ' style={{ fontSize: "14px" }}>Balance: 0.00 Max</Paragraph>

                    </div>

                  </Frame>

                </div>
                <div className="col-lg-4">

                  <Frame

                    animate={true}
                    level={1}
                    corners={4}
                    layer='primary'
                  >
                    <div style={{ padding: '30px 30px', fontSize: '32px' }}>
                      <div className="text-center d-flex gap-2 justify-content-center">

                        <Heading node='h6'> (01) Recent Transactions</Heading>

                      </div>
                      <div className="row">
                        <div className="col-1">
                          <Heading node='h6'> 1. </Heading>
                        </div>
                        <div className="col-11">
                          <Heading node='h6'>  Starting Swap</Heading>
                          <List node='ul' style={{ fontSize: "20px" }}>
                            <li>Minimum Crosschain Amount is 0.08 BNB
                            </li>
                            <li>Maximum Crosschain Amount is 12,000 BNB
                            </li>
                            <li>Estimated Time of Crosschain Arrival is 10-30 min
                            </li>
                            <li>
                              Crosschain amount larger than 2,100 BNB could take up to 12 hours
                            </li>
                          </List>
                        </div>
                        <div className="col-1">
                          <Heading node='h6'> 2. </Heading>
                        </div>
                        <div className="col-11">
                          <Heading node='h6'> Crossing Bridge </Heading>
                        </div>
                        <div className="col-1">
                          <Heading node='h6'> 3. </Heading>
                        </div>
                        <div className="col-11">
                          <Heading node='h6'> Approving Transfer </Heading>
                        </div>
                        <div className="col-1">
                          <Heading node='h6'> 4. </Heading>
                        </div>
                        <div className="col-11">
                          <Heading node='h6'> Complete </Heading>
                        </div>
                      </div>
                    </div>
                  </Frame>
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
  );

}
