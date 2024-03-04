import { useGetAll } from "./tools/datoCmsTools";
import XLSXExportButton from "./XLSXExportButton";

const BASE_URL = "https://iok2024.http-alapitvany.hu/";

const VipList = () => {
  const registrations = useGetAll("registration");
  const vipCodes = useGetAll("vipcode");
  const registeredVipUsers = registrations?.filter((reg) =>
    vipCodes?.some((code) => code.id === reg.vipCode)
  );

  const prepareExport = () => {
    const toExport = vipCodes.map((code) => {
      const codeToSend = btoa(`${code.email}#${code.id}`);

      return {
        name: code.name,
        email: code.email,
        nickName: code.nickName,
        codeToSend,
        url: `${BASE_URL}?q=${codeToSend}#regisztracio`,
      };
    });

    return [
      ["Név", "Megszólítás", "E-mail", "Küldhető kód", "URL"],
      ...toExport.map((i) => [
        i.name,
        i.nickName,
        i.email,
        i.codeToSend,
        i.url,
      ]),
    ];
  };

  return (
    <>
      <div>VIP kódok száma: {vipCodes?.length}</div>
      <div>Ebből regisztrált: {registeredVipUsers?.length}</div>

      <XLSXExportButton
        filename="iok2024-vip-kodok.xlsx"
        prepareExport={prepareExport}
      >
        VIP kódok legenerálása és exportálása
      </XLSXExportButton>
    </>
  );
};

export default VipList;
