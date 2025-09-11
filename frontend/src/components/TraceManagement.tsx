import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TraceAccount, TraceRecord } from "@/utils/types";
import { Edit2, Layers, Loader2, Plus, RefreshCw, Trash2, User } from 'lucide-react';
import { useState } from 'react';

// --- 1. 更新 Props 接口 ---
interface TraceManagementProps {
  newProductId: string;
  setNewProductId: (value: string) => void;
  loading: boolean;
  handleInitTrace: () => void;
  productIdInput: string;
  setProductIdInput: (value: string) => void;
  handleQueryTrace: () => void;
  currentTraceAccount: TraceAccount | null;
  // handleAddRecord 只接收 description
  handleAddRecord: (description: string) => void;
  handleEditClick: (index: number, record: TraceRecord) => void;
  handleDeleteClick: (index: number) => void;
  handleClearAll: () => void;

  showEditDialog: boolean;
  setShowEditDialog: (open: boolean) => void;
  editingRecord: { index: number; record: TraceRecord } | null;
  setEditingRecord: (record: { index: number; record: TraceRecord } | null) => void;
  // handleConfirmEdit 只接收 newDescription
  handleConfirmEdit: (newDescription: string) => void;

  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;
  setRecordToDelete: (index: number | null) => void;
  handleConfirmDelete: () => void;
}

export default function TraceManagement({
  newProductId,
  setNewProductId,
  loading,
  handleInitTrace,
  productIdInput,
  setProductIdInput,
  handleQueryTrace,
  currentTraceAccount,
  handleAddRecord,
  handleEditClick,
  handleDeleteClick,
  handleClearAll,
  showEditDialog,
  setShowEditDialog,
  editingRecord,
  setEditingRecord,
  handleConfirmEdit,
  showDeleteDialog,
  setShowDeleteDialog,
  setRecordToDelete,
  handleConfirmDelete,
}: TraceManagementProps) {

  const [newDescription, setNewDescription] = useState('');

  const [editDescription, setEditDescription] = useState('');

  const handleAdd = () => {
    if (!newDescription.trim()) return;
    handleAddRecord(newDescription);
    setNewDescription('');
  };

  const handleEdit = () => {
    if (!editDescription.trim()) return;
    handleConfirmEdit(editDescription);
  };

  const openEditDialog = (index: number, record: TraceRecord) => {
    handleEditClick(index, record);
    setEditDescription(record.description || '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>初始化溯源</CardTitle>
          <CardDescription>为新产品创建溯源记录 (最多20条)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入产品ID"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleInitTrace} disabled={loading || !newProductId}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              初始化
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>溯源记录管理</CardTitle>
          <CardDescription>查看和管理产品的溯源记录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="输入产品ID"
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value)}
              disabled={loading}
            />
            <Button variant="outline" onClick={handleQueryTrace} disabled={loading || !productIdInput}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              查询
            </Button>
          </div>

          {currentTraceAccount && (
            <>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">产品信息</h3>
                <p className="text-sm text-muted-foreground">产品ID: {currentTraceAccount.productId}</p>
                <p className="text-sm text-muted-foreground">记录数量: {currentTraceAccount.records.length} / 20</p>
              </div>

              {/* --- 4. 简化“添加记录”表单 --- */}
              <div className="space-y-3 border p-4 rounded-lg">
                <h4 className="font-medium">添加新记录</h4>
                <Textarea
                  placeholder="输入溯源描述信息..."
                  className="min-h-[100px]"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={loading}
                />
                <Button className="w-full" onClick={handleAdd} disabled={loading || !newDescription.trim()}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  添加记录
                </Button>
              </div>
            </>
          )}

          {/* --- 5. 简化表格 --- */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">时间</TableHead>
                  <TableHead className="w-[100px]">步骤</TableHead>
                  <TableHead className="w-[150px]">操作人</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!currentTraceAccount || currentTraceAccount.records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {!currentTraceAccount ? "请先查询产品" : "暂无溯源记录"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTraceAccount.records.map((record, index) => (
                    <TableRow key={`${currentTraceAccount.productId}-${index}`}>
                      <TableCell className="text-sm">
                        {new Date(record.ts * 1000).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{record.step || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[120px]" title={record.actor}>
                            {record.actor || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2" title={record.description}>
                          {record.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(index, record)} disabled={loading}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(index)} disabled={loading}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>编辑溯源记录</AlertDialogTitle>
            <AlertDialogDescription>
              您只能修改记录的描述。操作人和时间戳将被自动更新。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            {editingRecord && (
              <div className="text-sm text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
                <p><strong>步骤:</strong> {editingRecord.record.step}</p>
                <p><strong>原操作人:</strong> <span className="font-mono text-xs">{editingRecord.record.actor}</span></p>
                <p><strong>原时间:</strong> {new Date(editingRecord.record.ts * 1000).toLocaleString('zh-CN')}</p>
              </div>
            )}
            <label htmlFor="edit-description" className="text-sm font-medium">新描述</label>
            <Textarea
              id="edit-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="输入新的描述信息"
              className="min-h-[120px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingRecord(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleEdit} disabled={!editDescription.trim()}>
              保存修改
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条溯源记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}