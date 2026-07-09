"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct } from "@/lib/action/product.action";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { insertProductSchema } from "@/lib/validators";
import type { Product } from "@/types";

type ProductFormValues = z.infer<typeof insertProductSchema>;

type ProductFormProps = Readonly<{
	type: "Create" | "Update";
	product?: Product | null;
	productId?: string;
}>;

const defaultValues: ProductFormValues = {
	name: "",
	slug: "",
	category: "",
	description: "",
	images: [],
	price: 0,
	brand: "Pokemon",
	rating: 0,
	numReviews: 0,
	stock: 0,
	isFeatured: false,
	banner: null,
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function ProductForm({ type, product, productId }: ProductFormProps) {
	const router = useRouter();
	const isUpdate = type === "Update";
	const form = useForm<ProductFormValues>({
		resolver: zodResolver(insertProductSchema) as Resolver<ProductFormValues>,
		defaultValues: product
			? {
					name: product.name,
					slug: product.slug,
					category: product.category,
					description: product.description,
					images: product.images,
					price: product.price,
					brand: product.brand,
					rating: product.rating,
					numReviews: product.numReviews,
					stock: product.stock,
					isFeatured: product.isFeatured,
					banner: product.banner,
				}
			: defaultValues,
	});

	async function onSubmit(values: ProductFormValues) {
		const response =
			isUpdate && productId
				? await updateProduct({ ...values, id: productId })
				: await createProduct(values);

		if (!response.success) {
			toast.error(response.message);
			return;
		}

		toast.success(response.message);
		router.push("/admin/products");
		router.refresh();
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="rounded-lg">
					<CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>{type} Product</CardTitle>
							<p className="text-sm font-medium text-muted-foreground">
								Manage the product information shown in the
								storefront.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/products")}
						>
							Cancel
						</Button>
					</CardHeader>
					<CardContent className="grid gap-5">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Greninja ex 214/167 Special Illustration Rare"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug</FormLabel>
										<div className="flex gap-2">
											<FormControl>
												<Input
													placeholder="greninja-ex-214-167-special-illustration-rare"
													{...field}
												/>
											</FormControl>
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													form.setValue(
														"slug",
														slugify(
															form.getValues(
																"name",
															),
														),
														{
															shouldDirty: true,
															shouldValidate:
																true,
														},
													)
												}
											>
												Generate
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Input
												placeholder="Single Cards"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="brand"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Brand</FormLabel>
										<FormControl>
											<Input
												placeholder="Pokemon"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<textarea
											className={cn(
												"min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
											)}
											placeholder="Describe the product for the detail page."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="images"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Images</FormLabel>
									<div className="grid gap-3">
										{field.value.length > 0 ? (
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
												{field.value.map(
													(image, index) => (
														<div
															key={image}
															className="group relative overflow-hidden rounded-lg border bg-muted"
														>
															<div className="relative aspect-square">
																<Image
																	src={image}
																	alt={`Product image ${index + 1}`}
																	fill
																	sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
																	className="object-contain p-2"
																/>
															</div>
															<Button
																type="button"
																variant="destructive"
																size="icon-sm"
																className="absolute right-2 top-2 opacity-90"
																onClick={() => {
																	field.onChange(
																		field.value.filter(
																			(
																				currentImage,
																			) =>
																				currentImage !==
																				image,
																		),
																	);
																}}
																aria-label="Remove image"
															>
																<X />
															</Button>
														</div>
													),
												)}
											</div>
										) : (
											<div className="grid min-h-36 place-items-center rounded-lg border border-dashed p-6 text-center">
												<p className="text-sm font-medium text-muted-foreground">
													Upload at least one product
													image.
												</p>
											</div>
										)}

										<FormControl>
											<div className="rounded-lg border bg-card p-3">
												<UploadButton
													endpoint="productImageUploader"
													appearance={{
														container:
															"w-full items-start",
														button:
															"bg-primary text-primary-foreground hover:bg-primary/80 h-8 rounded-lg px-3 text-sm font-medium",
														allowedContent:
															"text-xs text-muted-foreground",
													}}
													content={{
														button: ({
															isUploading,
														}) =>
															isUploading
																? "Uploading..."
																: "Upload Images",
														allowedContent:
															"Images up to 4MB, 8 files max",
													}}
													onClientUploadComplete={(
														uploadedFiles,
													) => {
														const uploadedImages =
															uploadedFiles.map(
																(file) =>
																	file.ufsUrl,
															);

														field.onChange([
															...field.value,
															...uploadedImages,
														]);
														void form.trigger(
															"images",
														);
														toast.success(
															`${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"} uploaded`,
														);
													}}
													onUploadError={(error) => {
														toast.error(
															error.message,
														);
													}}
												/>
											</div>
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 md:grid-cols-4">
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="stock"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Stock</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="1"
												min="0"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="rating"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rating</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												max="5"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="numReviews"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Reviews</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="1"
												min="0"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
							<FormField
								control={form.control}
								name="banner"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Banner Image</FormLabel>
										<FormControl>
											<Input
												placeholder="/images/banner.webp"
												value={field.value ?? ""}
												onChange={(event) =>
													field.onChange(
														event.target.value ||
															null,
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="isFeatured"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Featured</FormLabel>
										<label className="flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-bold">
											<input
												type="checkbox"
												className="size-4 accent-primary"
												checked={field.value}
												onChange={(event) =>
													field.onChange(
														event.target.checked,
													)
												}
											/>
											Show as featured
										</label>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter className="justify-end gap-2">
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<Loader2 className="animate-spin" />
							) : (
								<Save />
							)}
							{type} Product
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}

export default ProductForm;
