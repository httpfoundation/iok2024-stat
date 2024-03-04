/* import styled from "styled-components" */
import  { useGetAll} from "./tools/datoCmsTools"
import { getRegistrationsForExport } from "./CSVExportLink"
import XLSXExportButton from "./XLSXExportButton"

const StatPage = () => {
	
	const stages = useGetAll("stage")
	const registrations = useGetAll("registration")
	const onsite = registrations.filter(r => r.onsite)
	const online = registrations.filter(r => (!(r.onsite)))
	
	const registrationsForExport = getRegistrationsForExport(registrations)
	
	const numberOfRegistrationFeedback = registrationsForExport.filter((registration) => registration.registrationFeedback ).length
	const numberOfTranslation = registrationsForExport.filter((registration) => (registration.translation)  ).length
	const numberOfCancellation = registrationsForExport.filter((registration) => (registration.registrationFeedback) &&  (!registration.onsite)).length

	const breakoutSessions = (stages.map(stage => {
		const regs = registrations?.filter((reg) => reg.stage===`${stage.id}`)
		return {name: stage.name, numberOfRegistration: regs.length}
	}))

	console.log(registrations)
	
	const onsiteBreakoutSessions = breakoutSessions.filter(bs => bs.numberOfRegistration>0)

	const prepareRegistrationExport = () => {
		if(!registrations) return;

		return [
      ["ID", "Név", "E-mail", "Telefonszám", "Munkahely", "Onsite", "Szekció", "VIP Kód", "Regisztráció visszajelzés", "Fordítás", "Hírlevél", "Regisztrálás dátuma"],
      ...registrations.map((i) => [
        i.id,
        i.name,
        i.email,
        i.phone,
        i.workplace,
        i.onsite,
        stages.find(x => x.id === i.stage)?.name || "",
        i.vipCode,
        i.registrationFeedback,
        i.translation,
        i.newsletter,
        i.createdAt,
      ]),
    ];
	}

	return (
		<>
			<div>Összes regisztráció: {registrations?.length}</div>
			<div>Regisztráció online részvételre: {online?.length}</div>
			<div>Regisztráció helyszíni részvételre: {onsite?.length ?? "0"}</div>
			<div>&nbsp;</div>
			{onsiteBreakoutSessions?.map((breakoutSession) => <div>{breakoutSession.name}: {breakoutSession.numberOfRegistration} </div> )}
			<div>&nbsp;</div>
			<div>Helyszíni résztvevő visszajelzés: {numberOfRegistrationFeedback}</div>
			<div>Ebből ennyi a lemondás: {numberOfCancellation}</div>
			<div>Tolmácsolást kér: {numberOfTranslation}</div>

			<XLSXExportButton filename="iok2024_jelentkezesek.xlsx" prepareExport={prepareRegistrationExport}>
				Regisztráltak exportálása Excel fájlba
			</XLSXExportButton>
		</>
	)
}



export default StatPage