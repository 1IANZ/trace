
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
} from "@/components/ui/alert-dialog"; // 修正：所有 AlertDialog 组件都从这里导入
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // 修正：从 UI 库导入 Table 组件
import { Textarea } from "@/components/ui/textarea";
import { TraceAccount, TraceRecord } from "@/utils/types";
import { Plus, RefreshCw, Trash2, Edit2 } from 'lucide-react';

interface TraceManagementProps {
  newProductId: string;
  setNewProductId: (value: string) => void;
  loading: boolean;
  handleInitTrace: () => void;
  productIdInput: string;
  setProductIdInput: (value: string) => void;
  handleQueryTrace: () => void;
  newRecordDescription: string;
  setNewRecordDescription: (value: string) => void;
  currentTraceAccount: TraceAccount | null;
  handleAddRecord: () => void;
  handleEditClick: (index: number, record: TraceRecord) => void;
  handleDeleteClick: (index: number) => void;
  handleClearAll: () => void;

  showEditDialog: boolean;
  setShowEditDialog: (open: boolean) => void;
  editingRecord: { index: number; record: TraceRecord } | null;
  setEditingRecord: (record: { index: number; record: TraceRecord } | null) => void;
  editDescription: string;
  setEditDescription: (description: string) => void;
  handleConfirmEdit: () => void;

  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;
  setRecordToDelete: (index: number | null) => void;
  handleConfirmDelete: () => void;
}

export default function TraceManagement({
  // 从 props 中解构所有需要用到的变量和函数
  newProductId,
  setNewProductId,
  loading,
  handleInitTrace,
  productIdInput,
  setProductIdInput,
  handleQueryTrace,
  newRecordDescription,
  setNewRecordDescription,
  currentTraceAccount,
  handleAddRecord,
  handleEditClick,
  handleDeleteClick,
  handleClearAll,
  showEditDialog,
  setShowEditDialog,
  editingRecord,
  setEditingRecord,
  editDescription,
  setEditDescription,
  handleConfirmEdit,
  showDeleteDialog,
  setShowDeleteDialog,
  setRecordToDelete,
  handleConfirmDelete,
}: TraceManagementProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>初始化溯源</CardTitle>
          <CardDescription>为新产品创建溯源记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入产品ID"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleInitTrace} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
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
            />
            <Button variant="outline" onClick={handleQueryTrace}>
              <RefreshCw className="mr-2 h-4 w-4" />
              查询
            </Button>
          </div>

          <Textarea
            placeholder="输入溯源描述信息"
            className="min-h-[100px]"
            value={newRecordDescription}
            onChange={(e) => setNewRecordDescription(e.target.value)}
            disabled={loading || !currentTraceAccount}
          />
          <Button
            className="w-full"
            onClick={handleAddRecord}
            disabled={loading || !currentTraceAccount}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加记录
          </Button>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">时间</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead className="text-right w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!currentTraceAccount || currentTraceAccount.records.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">暂无记录</TableCell></TableRow>
                ) : (
                  currentTraceAccount.records.map((record, index) => (
                    console.log(record.ts),
                    <TableRow key={`${currentTraceAccount.productId}-${index}`}>
                      <TableCell className="font-mono text-sm">{new Date(record.ts * 1000).toLocaleString()}</TableCell>
                      <TableCell className="max-w-md truncate">{record.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(index, record)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={loading || !currentTraceAccount}
              >
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
                <AlertDialogAction onClick={handleClearAll}>
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </CardContent>
      </Card>
      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除这条溯源记录吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑对话框 */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>编辑溯源记录</AlertDialogTitle>
            <AlertDialogDescription>修改溯源记录的描述信息</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="输入新的描述信息"
              className="min-h-[100px]"
            />
            {editingRecord && (
              <p className="text-sm text-muted-foreground mt-2">
                时间：{new Date(editingRecord.record.ts * 1000).toLocaleString()}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setEditingRecord(null); setEditDescription(''); }}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEdit}>保存修改</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}