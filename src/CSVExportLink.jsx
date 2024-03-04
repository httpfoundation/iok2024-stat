import { CSVLink } from "react-csv"
import {Button as MuiButton} from "@mui/material"
import { styled } from '@mui/system'

export const CSVExportLink = ({registrations, fileName, buttonTitle}) => {

	const csvReport = getCsvReportData(registrations, fileName)
	
	return (
		<CSVLink {...csvReport} separator=";" style={{textDecoration:"none"}}><Button variant="outlined" sx={{ width: 'fit-content' }}>{buttonTitle}</Button></CSVLink>
	)
}

const Button = styled(MuiButton)(
	{
		width: "400px",
		textDecoration: "none",
		marginTop: "20px"
	}
)

export const getRegistrationsForExport = registrations => {
	const registrationsForExport = registrations?.map(registration => {
		const {id, name, email, phone, workplace, title, onsite, stage, vipCode, registrationFeedback, translation, newsletter, createdAt} = registration
		return {id, name, email, phone, workplace, title, onsite, stage, vipCode, registrationFeedback, translation, newsletter, createdAt}
	})
	return registrationsForExport
}

const getCsvReportData = (registrations, fileName) => {

	const registrationsForExport = getRegistrationsForExport(registrations)
	const headers = [
		{ label: "id", key: "id" },
		{ label: "name", key: "name" },
		{ label: "email", key: "email" },
		{ label: "phone", key: "phone" },
		{ label: "workplace", key: "workplace" },
		{ label: "title", key: "title" },
		{ label: "onsite", key: "onsite" },
		{ label: "stage", key: "stage" },
		{ label: "vipCode", key: "vipCode" },
		{ label: "registrationFeedback", key: "registrationFeedback" },
		{ label: "translation", key: "translation" },
		{ label: "newsletter", key: "newsletter" },
		{ label: "createdAt", key: "createdAt" },
	  ]
	  const csvReport = {
		data: registrationsForExport,
		headers: headers,
		filename: fileName
	  };
	return csvReport
}

