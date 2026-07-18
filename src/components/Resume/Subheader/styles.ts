import { StyleSheet } from "@react-pdf/renderer";

export function createSubheaderStyles(primary: string) {
  return StyleSheet.create({
    root: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderTopColor: primary,
      borderBottomColor: primary,
      paddingVertical: 8,
    },
    row: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    linksRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 6,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      fontSize: 11,
      color: "#1a1a1a",
    },
    link: {
      flexDirection: "row",
      alignItems: "center",
      textDecoration: "none",
    },
    linkLabel: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: primary,
      textDecoration: "underline",
      marginLeft: 4,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: primary,
      marginHorizontal: 12,
    },
    spacer: {
      height: 14,
    },
  });
}
