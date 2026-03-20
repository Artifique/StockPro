export async function loadJsPdfWithAutoTable(): Promise<{
  jsPDF: typeof import("jspdf").default;
  autoTable: typeof import("jspdf-autotable").default;
}> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf/dist/jspdf.es.min.js"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}

export async function loadJsPdf(): Promise<typeof import("jspdf").default> {
  const { default: jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  return jsPDF;
}
