import { StyleSheet } from "@react-pdf/renderer";

export function createProjectStyles(primary: string) {
  return StyleSheet.create({
    titleLine: {
      fontSize: 10,
      paddingBottom: 2,
    },
    itemTitle: {
      fontFamily: "Helvetica-Bold",
      fontSize: 10,
      color: primary,
    },
    link: {
      fontFamily: "Helvetica",
      color: primary,
      textDecoration: "underline",
    },
    itemMeta: {
      color: "#555",
      fontSize: 9,
    },
    body: {
      color: "#333",
      paddingBottom: 2,
    },
    bullet: {
      color: "#333",
      marginLeft: 8,
      paddingBottom: 1,
    },
    itemSpacer: {
      height: 8,
    },
  });
}
