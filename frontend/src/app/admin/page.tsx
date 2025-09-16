'use client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addUserToWhitelist, appendRecord, clearRecords, deleteRecord,
  fetchtrace, fetchWhitelist, initTrace, removeUserFromWhitelist, updateRecord
} from '@/utils/pdas';
import { TraceAccount, TraceRecord } from '@/utils/types';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Loader2, UserMinus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import IDL from '../../anchor/idl/trace.json';
import { Trace } from '../../anchor/types/trace';

import TraceManagement from '@/components/trace-management';
import { toast } from "sonner";

const ADMIN_PUBKEY_STRING = "BYRNpGvSx1UKJ24z79gBpRYBNTGvBqZBPx2Cbw2GLKAa";

export default function Page() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [whitelistUsers, setWhitelistUsers] = useState<string[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string>('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [currentTraceAccount, setCurrentTraceAccount] = useState<TraceAccount | null>(null);
  const [productIdInput, setProductIdInput] = useState('');
  const [newProductId, setNewProductId] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ index: number; record: TraceRecord } | null>(null);

  useEffect(() => {
    async function init() {
      if (!wallet || !publicKey) return;
      setPageLoading(true);
      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
      const programInstance = new Program<Trace>(IDL as any, provider);
      setProgram(programInstance);
      setIsAdmin(publicKey.toString() === ADMIN_PUBKEY_STRING);
      try {
        const whitelist = await fetchWhitelist(programInstance);
        if (!whitelist.some(pk => pk.toString() === publicKey.toString())) router.push('/');
        else setWhitelistUsers(whitelist.map(pk => pk.toString()));
      } catch { router.push('/'); }
      setPageLoading(false);
    }
    init();
  }, [publicKey, connection, wallet, router]);

  const fetchAndUpdateWhitelist = async () => {
    if (!program) return;
    const updatedWhitelist = await fetchWhitelist(program);
    setWhitelistUsers(updatedWhitelist.map(pk => pk.toString()));
  };

  const handleAddUser = async () => {
    if (!program || !newUserAddress) return toast.warning("请输入有效的钱包地址。");
    setOperationLoading(true);
    const result = await addUserToWhitelist(program, new web3.PublicKey(newUserAddress));
    if (result.success) {
      toast.success("用户添加成功！");
      setNewUserAddress('');
      await fetchAndUpdateWhitelist();
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleConfirmRemove = async () => {
    if (!program || !userToRemove) return;
    setOperationLoading(true);
    const result = await removeUserFromWhitelist(program, new web3.PublicKey(userToRemove));
    if (result.success) {
      toast.success("用户移除成功！");
      await fetchAndUpdateWhitelist();
      setShowRemoveDialog(false);
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleInitTrace = async () => {
    if (!program || !newProductId) return toast.warning("请输入产品ID。");
    setOperationLoading(true);
    const result = await initTrace(program, newProductId);
    if (result.success) {
      toast.success(`产品 "${newProductId}" 初始化成功！`);
      setNewProductId('');
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : "发生未知错误";
      toast.error(errorMessage);
    }
    setOperationLoading(false);
  };

  const handleQueryTrace = async () => {
    if (!program || !productIdInput) return toast.warning("请输入要查询的产品ID。");
    setOperationLoading(true);
    const traceAccount = await fetchtrace(program, productIdInput);
    setCurrentTraceAccount(traceAccount);
    if (!traceAccount) toast.info(`未找到产品ID为 "${productIdInput}" 的记录。`);
    setOperationLoading(false);
  };

  const handleAddRecord = async (description: string) => {
    if (!program || !currentTraceAccount) return;
    setOperationLoading(true);
    const result = await appendRecord(program, currentTraceAccount.productId, description);
    if (result.success) {
      toast.success("新记录添加成功！");
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleConfirmEdit = async (description: string) => {
    if (!program || !editingRecord || !currentTraceAccount) return;
    setOperationLoading(true);
    const result = await updateRecord(program, currentTraceAccount.productId, editingRecord.index, description);
    if (result.success) {
      toast.success("记录更新成功！");
      setShowEditDialog(false);
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!program || recordToDelete === null || !currentTraceAccount) return;
    setOperationLoading(true);
    const result = await deleteRecord(program, currentTraceAccount.productId, recordToDelete);
    if (result.success) {
      toast.success("记录删除成功！");
      setShowDeleteDialog(false);
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleClearAll = async () => {
    if (!program || !currentTraceAccount) return;
    setOperationLoading(true);
    const result = await clearRecords(program, currentTraceAccount.productId);
    if (result.success) {
      toast.success("所有记录已清空！");
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setOperationLoading(false);
  };

  const handleDeleteClick = (index: number) => { setRecordToDelete(index); setShowDeleteDialog(true); };
  const handleEditClick = (index: number, record: TraceRecord) => { setEditingRecord({ index, record }); setShowEditDialog(true); };
  const handleRemoveClick = (user: string) => { setUserToRemove(user); setShowRemoveDialog(true); };

  const traceManagementProps = {
    newProductId, setNewProductId, loading: operationLoading, handleInitTrace,
    productIdInput, setProductIdInput, handleQueryTrace,
    currentTraceAccount,
    handleAddRecord, handleEditClick, handleDeleteClick, handleClearAll,
    showEditDialog, setShowEditDialog, editingRecord, setEditingRecord,
    handleConfirmEdit,
    showDeleteDialog, setShowDeleteDialog, setRecordToDelete, handleConfirmDelete,
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-row justify-between ">
        <h1 className="text-3xl font-bold mb-6">{isAdmin ? '管理员操作页面' : '溯源管理页面'}</h1>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
      {isAdmin ? (
        <Tabs defaultValue="whitelist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whitelist">白名单管理</TabsTrigger>
            <TabsTrigger value="trace">溯源管理</TabsTrigger>
          </TabsList>
          <TabsContent value="whitelist">
            <Card>
              <CardHeader><CardTitle>白名单管理</CardTitle><CardDescription>管理有权限访问溯源系统的用户</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="输入用户钱包地址" value={newUserAddress} onChange={(e) => setNewUserAddress(e.target.value)} disabled={operationLoading} />
                  <Button onClick={handleAddUser} disabled={operationLoading || !newUserAddress}>
                    {operationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    添加用户
                  </Button>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader><TableRow><TableHead>用户地址</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {whitelistUsers.map((user) => (
                        <TableRow key={user}>
                          <TableCell className="font-mono text-sm">{user}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveClick(user)} disabled={operationLoading}>
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
          <TabsContent value="trace"><TraceManagement {...traceManagementProps} /></TabsContent>
        </Tabs>
      ) : (<TraceManagement {...traceManagementProps} />)}

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>确定要将地址 {userToRemove.slice(0, 8)}...{userToRemove.slice(-8)} 从白名单中移除吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} disabled={operationLoading}>
              {operationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
