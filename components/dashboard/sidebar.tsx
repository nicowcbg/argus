"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, LogOut, MessageSquarePlus, Mail } from "lucide-react"
import Image from "next/image"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  chats?: { id: string; title: string | null; updated_at: string }[]
}

export function Sidebar({ user, chats = [] }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-card">
      <div className="p-6 border-b">
        <Link href="/home" className="text-2xl font-bold">
          Argus
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/home">
          <Button
            variant={pathname === "/home" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/new">
          <Button
            variant={pathname === "/new" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New chat
          </Button>
        </Link>
        <Link href="/emails">
          <Button
            variant={pathname === "/emails" ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Mail className="mr-2 h-4 w-4" />
            Emails
          </Button>
        </Link>

        {chats.length > 0 && (
          <div className="pt-4 space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Chats
            </p>
            {chats.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <Button
                  variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
                  className="w-full justify-start text-left font-normal truncate max-w-full"
                >
                  <span className="truncate">
                    {chat.title || "New chat"}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-muted">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
