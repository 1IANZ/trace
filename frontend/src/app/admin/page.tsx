'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import IDL from '../../anchor/idl/trace.json';
import { Trace } from '../../anchor/types/trace';
import { fetchWhitelist } from '@/utils/pdas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';

export default function AdminPage() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [loading, setLoading] = useState(true);
  const [whitelistUsers, setWhitelistUsers] = useState<string[]>([]);

  // AlertDialog 状态
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string>('');

  useEffect(() => {
    async function init() {
      if (!wallet) {
        return null;
      }
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      const program: Program<Trace> = new Program(IDL as any, provider);
      setProgram(program);
      const whitelistUsers = await fetchWhitelist(program);
      const isWhitelisted = whitelistUsers.some(pk => pk.toString() === publicKey!.toString());
      if (!isWhitelisted) {
        router.push('/');
      } else {
        setWhitelistUsers(whitelistUsers.map(pk => pk.toString()));
        setLoading(false);
      }
    }
    init();
  }, [publicKey, connection]);

  const handleRemoveClick = (user: string) => {
    setUserToRemove(user);
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = () => {
    // 在这里调用你的移除函数
    console.log('移除用户:', userToRemove);
    setShowRemoveDialog(false);
    setUserToRemove('');
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-200 text-lg">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">管理员操作页面</h1>

      <Tabs defaultValue="whitelist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="whitelist">白名单管理</TabsTrigger>
          <TabsTrigger value="trace">溯源管理</TabsTrigger>
        </TabsList>

        {/* 白名单管理 */}
        <TabsContent value="whitelist">
          <Card>
            <CardHeader>
              <CardTitle>白名单管理</CardTitle>
              <CardDescription>
                管理有权限访问溯源系统的用户
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入用户钱包地址"
                />
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  添加用户
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户地址</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistUsers.map((user) => (
                      <TableRow key={user}>
                        <TableCell className="font-mono text-sm">
                          {user}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveClick(user)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 溯源管理*/}
        <TabsContent value="trace">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>初始化溯源</CardTitle>
                <CardDescription>
                  为新产品创建溯源记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入产品ID"
                  />
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    初始化
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 溯源记录管理 */}
            <Card>
              <CardHeader>
                <CardTitle>溯源记录管理</CardTitle>
                <CardDescription>
                  查看和管理产品的溯源记录
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入产品ID"
                  />
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    查询
                  </Button>
                </div>

                <div className="space-y-2">
                  <label>添加新记录</label>
                  <Textarea
                    placeholder="输入溯源描述信息"
                    className="min-h-[100px]"
                  />
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    添加记录
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">时间戳</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          暂无记录
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      清空所有记录
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认清空</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将删除该产品的所有溯源记录，且无法恢复。确定要继续吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction>确认清空</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 共享的 AlertDialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将地址 {userToRemove.slice(0, 8)}...{userToRemove.slice(-8)} 从白名单中移除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}