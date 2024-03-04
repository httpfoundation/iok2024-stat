import { Button, ButtonProps } from "@mui/material";
import { FC } from "react";
import xlsx from "node-xlsx";

interface XLSXExportButtonProps extends Omit<ButtonProps, "onClick"> {
  prepareExport: () => any[][];
  filename: string;
}

const XLSXExportButton: FC<XLSXExportButtonProps> = ({
  variant = "outlined",
  sx,
  prepareExport,
  filename,
  ...rest
}) => {
  const handleExport = () => {
    const rows = prepareExport();

    const content = xlsx.build([{ name: filename, data: rows, options: {} }]);

    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant={variant}
      sx={{ mt: "20px", ...sx }}
      onClick={handleExport}
      {...rest}
    />
  );
};

export default XLSXExportButton;
