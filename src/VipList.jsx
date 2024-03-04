import {
  Alert,
  Button,
  Divider,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { useGetAll } from "./tools/datoCmsTools";
import XLSXExportButton from "./XLSXExportButton";
import { useState } from "react";
import { SiteClient } from "datocms-client";

const BASE_URL = "https://iok2024.http-alapitvany.hu/";

const VipList = () => {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const uploadVipList = async () => {
    if (!csv.trim()) return;

    setLoading(true);
    const client = new SiteClient(localStorage.getItem("apiKey"));
    const vipList = csv.split("\n").map((line) => {
      const splitLine = line.split(";");
      return {
        name: splitLine[0],
        nick_name: splitLine[1],
        email: splitLine[2],
      };
    });

    for (const i of vipList) {
      try {
        await client.items.create({
          itemType: "94460",
          ...i,
        });
      } catch {}
    }

    setLoading(false);
    setSnackbarOpen(true);
    setCsv("");
  };

  return (
    <>
      <div>VIP kódok száma: {vipCodes?.length}</div>
      <div>Ebből regisztrált: {registeredVipUsers?.length}</div>

      <Stack alignItems="flex-start" gap={2}>
        <XLSXExportButton
          filename="iok2024-vip-kodok.xlsx"
          prepareExport={prepareExport}
        >
          VIP kódok legenerálása és exportálása
        </XLSXExportButton>

        <Divider flexItem sx={{ borderColor: "grey.400" }} />

        <TextField
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          multiline
          rows={5}
          label="CSV Tartalma"
          sx={{ width: "500px" }}
          InputLabelProps={{ shrink: true }}
          placeholder="név;megszólítás;email"
        />
        <Button variant="outlined" onClick={uploadVipList} disabled={loading}>
          VIP Lista Feltöltése
        </Button>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            VIP lista sikeresen feltöltve!
          </Alert>
        </Snackbar>
      </Stack>
    </>
  );
};

export default VipList;
