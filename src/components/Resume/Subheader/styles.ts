import { StyleSheet } from "@react-pdf/renderer";

const accent = "#0f766e";

export const styles = StyleSheet.create({
  root: {
    marginBottom: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: accent,
    borderBottomColor: accent,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 11,
    color: "#1a1a1a",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: accent,
    marginHorizontal: 16,
  },
});
