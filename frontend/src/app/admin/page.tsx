'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import IDL from '../../anchor/idl/trace.json';
import { Trace } from '../../anchor/types/trace';
import {
  addUserToWhitelist, appendRecord, clearRecords, deleteRecord,
  fetchtrace, fetchWhitelist, initTrace, removeUserFromWhitelist, updateRecord
} from '@/utils/pdas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { TraceAccount, TraceRecord } from '@/utils/types';

import { toast } from "sonner";
import TraceManagement from '@/components/TraceManagement';

const ADMIN_PUBKEY_STRING = "BYRNpGvSx1UKJ24z79gBpRYBNTGvBqZBPx2Cbw2GLKAa";

export default function AdminPage() {
  // --- States and Hooks ---
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [whitelistUsers, setWhitelistUsers] = useState<string[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string>('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [currentTraceAccount, setCurrentTraceAccount] = useState<TraceAccount | null>(null);
  const [productIdInput, setProductIdInput] = useState('');
  const [newProductId, setNewProductId] = useState<string>("");
  const [newRecordDescription, setNewRecordDescription] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ index: number; record: TraceRecord } | null>(null);
  const [editDescription, setEditDescription] = useState('');

  // --- Initialization ---
  useEffect(() => {
    async function init() {
      if (!wallet || !publicKey) return;
      setLoading(true);
      const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
      const programInstance = new Program<Trace>(IDL as any, provider);
      setProgram(programInstance);
      setIsAdmin(publicKey.toString() === ADMIN_PUBKEY_STRING);
      try {
        const whitelist = await fetchWhitelist(programInstance);
        if (!whitelist.some(pk => pk.toString() === publicKey.toString())) router.push('/');
        else setWhitelistUsers(whitelist.map(pk => pk.toString()));
      } catch { router.push('/'); }
      setLoading(false);
    }
    init();
  }, [publicKey, connection, wallet, router]);

  // --- Helper Functions ---
  const fetchAndUpdateWhitelist = async () => {
    if (!program) return;
    const updatedWhitelist = await fetchWhitelist(program);
    setWhitelistUsers(updatedWhitelist.map(pk => pk.toString()));
  };

  // --- Business Logic Handlers ---
  const handleAddUser = async () => {
    if (!program || !newUserAddress) return toast.warning("请输入有效的钱包地址。");
    setIsLoading(true);
    const result = await addUserToWhitelist(program, new web3.PublicKey(newUserAddress));
    if (result.success) {
      toast.success("用户添加成功！");
      setNewUserAddress('');
      await fetchAndUpdateWhitelist();
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleConfirmRemove = async () => {
    if (!program || !userToRemove) return;
    setIsLoading(true);
    const result = await removeUserFromWhitelist(program, new web3.PublicKey(userToRemove));
    if (result.success) {
      toast.success("用户移除成功！");
      await fetchAndUpdateWhitelist();
      setShowRemoveDialog(false);
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleInitTrace = async () => {
    if (!program || !newProductId) return toast.warning("请输入产品ID。");
    setIsLoading(true);
    const result = await initTrace(program, newProductId);
    if (result.success) {
      toast.success(`产品 "${newProductId}" 初始化成功！`);
      setNewProductId('');
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleQueryTrace = async () => {
    if (!program || !productIdInput) return toast.warning("请输入要查询的产品ID。");
    setIsLoading(true);
    const traceAccount = await fetchtrace(program, productIdInput);
    setCurrentTraceAccount(traceAccount);
    if (!traceAccount) toast.info(`未找到产品ID为 "${productIdInput}" 的记录。`);
    setIsLoading(false);
  };

  const handleAddRecord = async () => {
    if (!program || !currentTraceAccount || !newRecordDescription) return;
    setIsLoading(true);
    const result = await appendRecord(program, currentTraceAccount.productId, newRecordDescription);
    if (result.success) {
      toast.success("新记录添加成功！");
      setNewRecordDescription('');
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleConfirmEdit = async () => {
    if (!program || !editingRecord || !currentTraceAccount) return;
    setIsLoading(true);
    const result = await updateRecord(program, currentTraceAccount.productId, editingRecord.index, editDescription);
    if (result.success) {
      toast.success("记录更新成功！");
      setShowEditDialog(false);
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!program || recordToDelete === null || !currentTraceAccount) return;
    setIsLoading(true);
    const result = await deleteRecord(program, currentTraceAccount.productId, recordToDelete);
    if (result.success) {
      toast.success("记录删除成功！");
      setShowDeleteDialog(false);
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleClearAll = async () => {
    if (!program || !currentTraceAccount) return;
    setIsLoading(true);
    const result = await clearRecords(program, currentTraceAccount.productId);
    if (result.success) {
      toast.success("所有记录已清空！");
      await handleQueryTrace();
    } else { toast.error(result.error); }
    setIsLoading(false);
  };
  const handleDeleteClick = (index: number) => { setRecordToDelete(index); setShowDeleteDialog(true); };
  const handleEditClick = (index: number, record: TraceRecord) => { setEditingRecord({ index, record }); setEditDescription(record.description); setShowEditDialog(true); };
  const handleRemoveClick = (user: string) => { setUserToRemove(user); setShowRemoveDialog(true); };

  const traceManagementProps = {
    newProductId, setNewProductId, isLoading, handleInitTrace,
    productIdInput, setProductIdInput, handleQueryTrace,
    newRecordDescription, setNewRecordDescription, currentTraceAccount,
    handleAddRecord, handleEditClick, handleDeleteClick, handleClearAll,
    showEditDialog, setShowEditDialog, editingRecord, setEditingRecord,
    editDescription, setEditDescription, handleConfirmEdit,
    showDeleteDialog, setShowDeleteDialog, setRecordToDelete, handleConfirmDelete,
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div></div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{isAdmin ? '管理员操作页面' : '溯源管理页面'}</h1>
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
                  <Input placeholder="输入用户钱包地址" value={newUserAddress} onChange={(e) => setNewUserAddress(e.target.value)} disabled={isLoading} />
                  <Button onClick={handleAddUser} disabled={isLoading}><UserPlus className="mr-2 h-4 w-4" /> 添加用户</Button>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader><TableRow><TableHead>用户地址</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {whitelistUsers.map((user) => (
                        <TableRow key={user}>
                          <TableCell className="font-mono text-sm">{user}</TableCell>
                          <TableCell className="text-right"><Button variant="destructive" size="sm" onClick={() => handleRemoveClick(user)}><UserMinus className="h-4 w-4" /></Button></TableCell>
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
            <AlertDialogAction onClick={handleConfirmRemove}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}