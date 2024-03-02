import React, { useEffect, useRef, useState } from 'react'
import './App.scss'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,

  } from "react-router-dom"
import {Button, Container, FormControl, FormHelperText, Input, InputLabel, TextField} from "@mui/material"

import StatPage from './StatPage'
import { Box, styled } from '@mui/system'
import VisitorCount from './VisitorCount'
import Questions from './Questions'
import Ratings from './Ratings'

/*
const Container = styled('div')`
    display: grid;
	grid-template-columns: auto;
    justify-content:center;
    align-items: center;
    color: white;
    background-color: #47CCD4;
	padding: 50px;
	a {text-decoration: "none"}	
`
*/

export const AppContext = React.createContext<undefined | {apiKey: string}>(undefined)

function App() {

	const [loggedIn, setLoggedIn] = useState(false)
	const [apiKey, setApiKey] = useState("")
	const [password, setPassword] = useState<any>("")
	const [message, setMessage] = useState<any>("Nincs bejelentkezve")
	const {inputElementRef, setInputFocus} = useInputFocus()
	const localStorageApiKey = localStorage.getItem("apiKey")
	useEffect(() => {
		if (localStorageApiKey) {
			setApiKey(localStorageApiKey)
			setLoggedIn(true)
		}
	}, [])
	
	const submitPassword = async () => {
			const baseUrl = "https://l334zfnmy3.execute-api.eu-west-1.amazonaws.com/default/forEvenTimeLogin"
			const response = await fetch(baseUrl, {method: "post", body: JSON.stringify({password: password})});
			const msg = await response.json();
			console.log("msg", msg)
		if (msg?.status === "OK") {
			setLoggedIn(true)
			setApiKey(msg.apiKey)
			localStorage.setItem("apiKey", msg.apiKey);
		}
		else {
			setPassword("")
			setMessage("Hibás jelszó!")
			setInputFocus()
		}
	}
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
		setMessage("")
	}

	useEffect(() => {
		setInputFocus()
	}, [setInputFocus])

	console.log("apiKey", apiKey)	

	return (
		<AppContext.Provider 
			value={{apiKey: apiKey}}
		>
			<Box className="app-bg">
				{(loggedIn) ? (
					<Router>
						<Container sx={{}}>
							<h1>IOK 2024 statisztika</h1>
							<Box sx={{mb: 4}}>
								<Link to="/"><Button variant="contained" color="primary">Jelentkezések</Button></Link>
								<Link to="/jelenlet"><Button variant="contained" color="primary" sx={{ml: 2}}>Jelenlét</Button></Link>
								<Link to="/kerdesek"><Button variant="contained" color="primary" sx={{ml: 2}}>Kérdések</Button></Link>
								<Link to="/ertekelesek"><Button variant="contained" color="primary" sx={{ml: 2}}>Értékelések</Button></Link>
							</Box>
							<Routes>
								<Route path="/" element={<StatPage />} />
								<Route path="/jelenlet" element={<VisitorCount />} />
								<Route path="/kerdesek" element={<Questions />} />
								<Route path="/ertekelesek" element={<Ratings />} />
							</Routes>
						</Container>
					</Router>
				):
				<Box
					sx={{
					display: 'flex',
					justifyContent: 'center',
					p: 1,
					m: 1,
					bgcolor: 'background.paper',
					borderRadius: 1,
				}}
			  >
					<Box sx={{ justifyContent: 'center' }}>
						<FormControl>
							<InputLabel htmlFor="my-input">Jelszó</InputLabel>
							<Input 
								id="my-input" 
								type="password" 
								value={password} 
								onChange={handlePasswordChange}
								inputRef={inputElementRef}
								
							/>		
							<Button variant="contained" color="primary" 
								onClick={submitPassword} sx={{mt:2}}>Bejelentkezés</Button>
						</FormControl>
						<Box sx={{mt:2, mb:2}}>
							{message}
						</Box>
					</Box>
				</Box> 
				}
			</Box>
		</AppContext.Provider>
	)
}

export default App



/* const useApiKey = () => {
	const [apiKey, setApiKey] = useState("93ab196b2bc95f22977a2abdd83ded")
	return {apiKey, setApiKey}
} */

const useInputFocus = () => {
    const inputElementRef = useRef<HTMLInputElement>(null)
    const setInputFocus = () => {inputElementRef.current &&  inputElementRef.current.focus()}
    return {inputElementRef, setInputFocus} 
}