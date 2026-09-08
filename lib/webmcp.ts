type State = { picture: number; total: number; fills: Record<number,string>; colors: string[] };
type Tool = { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown };
type Context = { registerTool: (tool: Tool, options?: { signal: AbortSignal }) => void | Promise<void> };
export function registerColoringTools(read:()=>State, fill:(id:number,color:string)=>void) {
 const context=(document as Document & {modelContext?:Context}).modelContext;
 if(!context?.registerTool)return;
 const life=new AbortController();
 const tools:Tool[]=[
  {name:'read_coloring_state',description:'Read the current picture, available region IDs (0 to total-1), colors and completed fills.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>read()},
  {name:'fill_coloring_regions',description:'Fill one or more regions in the current picture using available palette colors. Updates the visible artwork and its local saved progress.',inputSchema:{type:'object',properties:{fills:{type:'array',minItems:1,maxItems:50,items:{type:'object',properties:{region:{type:'integer',minimum:0},color:{type:'string'}},required:['region','color'],additionalProperties:false}}},required:['fills'],additionalProperties:false},annotations:{readOnlyHint:false},execute:(input)=>{
   if(!input||typeof input!=='object'||!('fills' in input)||!Array.isArray(input.fills)||input.fills.length<1||input.fills.length>50)throw new Error('Expected 1–50 fills.');
   const state=read();
   for(const entry of input.fills)if(!entry||!Number.isInteger(entry.region)||entry.region<0||entry.region>=state.total||!state.colors.includes(entry.color))throw new Error('Invalid region or palette color.');
   for(const entry of input.fills)fill(entry.region,entry.color);
   return read();
  }}
 ];
 for(const tool of tools)try{void Promise.resolve(context.registerTool(tool,{signal:life.signal})).catch(()=>{});}catch{}
 return()=>life.abort();
}
