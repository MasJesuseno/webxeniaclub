import {
  getRequiredMenuKey,
  hasMenuAccess,
  getFirstAllowedPath,
  filterMenuByPermissions,
  ALL_PERMISSIONS,
  ADMIN_MENU,
} from "../src/lib/admin-menu"

let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    console.log(`  ✗ ${name} → got ${a}, expected ${e}`)
  }
}

console.log("Total menu items:", ADMIN_MENU.flatMap((s) => s.items).length)
console.log("Sections:", ADMIN_MENU.map((s) => s.section).join(", "))

console.log("\n— getRequiredMenuKey —")
check("dashboard exact", getRequiredMenuKey("/admin"), "dashboard")
check("posts list", getRequiredMenuKey("/admin/posts"), "posts")
check("posts create (subpage)", getRequiredMenuKey("/admin/posts/create"), "posts")
check("posts edit (subpage)", getRequiredMenuKey("/admin/posts/abc/edit"), "posts")
check("buku member edit", getRequiredMenuKey("/admin/buku-member/xyz/edit"), "buku-member")
check("kartu member", getRequiredMenuKey("/admin/prospective-members/kartu/xyz"), "prospective-members")
check("financial edit", getRequiredMenuKey("/admin/financial-reports/xyz/edit"), "financial-reports")
check("unknown path", getRequiredMenuKey("/admin/unknown"), null)

console.log("\n— hasMenuAccess —")
check("full access", hasMenuAccess([ALL_PERMISSIONS], "/admin/posts"), true)
check("allowed key", hasMenuAccess(["posts"], "/admin/posts/create"), true)
check("denied key", hasMenuAccess(["posts"], "/admin/users"), false)
check("dashboard denied", hasMenuAccess([], "/admin"), false)
check("dashboard allowed", hasMenuAccess(["dashboard"], "/admin"), true)
check("unknown path allowed", hasMenuAccess([], "/admin/whatever"), true)
check("non-array", hasMenuAccess(undefined as any, "/admin"), false)

console.log("\n— getFirstAllowedPath —")
check("super admin", getFirstAllowedPath([ALL_PERMISSIONS]), "/admin")
check("only financial", getFirstAllowedPath(["financial-reports"]), "/admin/financial-reports")
check("nothing", getFirstAllowedPath([]), "/")
check("dashboard only", getFirstAllowedPath(["dashboard"]), "/admin")

console.log("\n— filterMenuByPermissions —")
const editorFiltered = filterMenuByPermissions(["dashboard", "posts", "comments"])
const editorKeys = editorFiltered.flatMap((s) => s.items.map((i) => i.key))
check("editor keys", editorKeys, ["dashboard", "posts", "comments"])
check("editor section names", editorFiltered.map((s) => s.section), ["Utama", "Konten", "Member"])
check("empty permissions", filterMenuByPermissions([]), [])
check("super admin passes all", filterMenuByPermissions([ALL_PERMISSIONS]).flatMap((s) => s.items).length,
  ADMIN_MENU.flatMap((s) => s.items).length)

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
