import Link from "next/link";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function AdminNav() {
  return (
    <>
      <Link href="/admin/players">
        <DropdownMenuItem className="cursor-pointer">
          Manage Players
        </DropdownMenuItem>
      </Link>
      <Link href="/admin/matches">
        <DropdownMenuItem className="cursor-pointer">
          Manage Matches
        </DropdownMenuItem>
      </Link>
      <Link href="/admin/articles">
        <DropdownMenuItem className="cursor-pointer">
          Manage Articles
        </DropdownMenuItem>
      </Link>
      <Link href="/admin/tournaments">
        <DropdownMenuItem className="cursor-pointer">
          Manage Tournament
        </DropdownMenuItem>
      </Link>
    </>
  );
}
