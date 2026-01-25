import tkinter as tk
from tkinter import ttk, messagebox
import requests
from inceptionclient import InceptionClient



class InceptionGUI:
    """Simple GUI for testing Inception API"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("AccessOS - Test GUI")
        self.root.geometry("400x700")
        
        self.client = None  # Will hold InceptionClient after login
        
        self.create_widgets()
        self.do_login()
    
    def create_widgets(self):
        # === LOGIN SECTION ===
        login_frame = ttk.LabelFrame(self.root, text="Login", padding=10)
        login_frame.pack(fill="x", padx=10, pady=5)
        
        # Inception Serial
        ttk.Label(login_frame, text="Inception Serial:").grid(row=0, column=0, sticky="w")
        self.serial_entry = ttk.Entry(login_frame, width=30)
        self.serial_entry.grid(row=0, column=1, pady=2)
        self.serial_entry.insert(0, "192.168.0.115")  # Default value - change to yours
        
        # Username
        ttk.Label(login_frame, text="Username:").grid(row=1, column=0, sticky="w")
        self.username_entry = ttk.Entry(login_frame, width=30)
        self.username_entry.grid(row=1, column=1, pady=2)
        self.username_entry.insert(0, "AccessOS")  # Default value
        
        # Password
        ttk.Label(login_frame, text="Password:").grid(row=2, column=0, sticky="w")
        self.password_entry = ttk.Entry(login_frame, width=30, show="*")
        self.password_entry.grid(row=2, column=1, pady=2)
        self.password_entry.insert(0, "AccessOS")  # Default value
        
        # Login Button
        self.login_btn = ttk.Button(login_frame, text="Login", command=self.do_login)
        self.login_btn.grid(row=3, column=0, columnspan=2, pady=10)
        
        # Status Label
        self.status_label = ttk.Label(login_frame, text="Not connected", foreground="red")
        self.status_label.grid(row=4, column=0, columnspan=2)
        
        # === AREAS SECTION ===
        areas_frame = ttk.LabelFrame(self.root, text="Areas", padding=10)
        areas_frame.pack(fill="x", padx=10, pady=5)
        
        self.areas_combo = ttk.Combobox(areas_frame, width=40, state="readonly")
        self.areas_combo.pack(pady=5)
        
        ttk.Button(areas_frame, text="Refresh Areas", command=self.load_areas).pack()
        
        # Area Details
        self.area_details = tk.Text(areas_frame, height=4, width=45)
        self.area_details.pack(pady=5)
        
        # Bind selection event
        self.areas_combo.bind("<<ComboboxSelected>>", self.on_area_selected)
        
        # === OUTPUTS SECTION ===
        outputs_frame = ttk.LabelFrame(self.root, text="Outputs", padding=10)
        outputs_frame.pack(fill="x", padx=10, pady=5)
        
        self.outputs_combo = ttk.Combobox(outputs_frame, width=40, state="readonly")
        self.outputs_combo.pack(pady=5)
        
        ttk.Button(outputs_frame, text="Refresh Outputs", command=self.load_outputs).pack()
        
        # Output Details
        self.output_details = tk.Text(outputs_frame, height=4, width=45)
        self.output_details.pack(pady=5)
        
        # Bind selection event
        self.outputs_combo.bind("<<ComboboxSelected>>", self.on_output_selected)

        ttk.Button(outputs_frame, text="Unlock Door", command=self.on_unlockbtn).pack()
        
        # Store the actual data (not just names)
        self.areas_data = []
        self.outputs_data = []
    
    def do_login(self):
        """Handle login button click"""
        serial = self.serial_entry.get()
        username = self.username_entry.get()
        password = self.password_entry.get()
        
        try:
            self.client = InceptionClient(serial)
            session_id = self.client.login(username, password)
            
            self.status_label.config(text=f"Connected! Session: {session_id[:8]}...", foreground="green")
            # messagebox.showinfo("Success", "Login successful!")
            
            # Auto-load areas and outputs after login
            self.load_areas()
            self.load_outputs()
            
        except Exception as e:
            self.status_label.config(text="Connection failed", foreground="red")
            messagebox.showerror("Error", f"Login failed:\n{str(e)}")
    
    def load_areas(self):
        """Fetch and display areas"""
        if not self.client:
            messagebox.showwarning("Warning", "Please login first")
            return
        
        try:
            self.areas_data = self.client.get_all_areas()
            area_names = [area["Name"] for area in self.areas_data]
            self.areas_combo["values"] = area_names
            
            if area_names:
                self.areas_combo.current(0)
                self.on_area_selected(None)
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load areas:\n{str(e)}")
    
    def load_outputs(self):
        """Fetch and display outputs"""
        if not self.client:
            messagebox.showwarning("Warning", "Please login first")
            return
        
        try:
            self.outputs_data = self.client.get_doors()
            output_names = [output["Name"] for output in self.outputs_data]
            self.outputs_combo["values"] = output_names
            
            if output_names:
                self.outputs_combo.current(0)
                self.on_output_selected(None)
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load outputs:\n{str(e)}")
    
    def on_area_selected(self, event):
        """When user selects an area, show its details"""
        index = self.areas_combo.current()
        if index >= 0 and index < len(self.areas_data):
            area = self.areas_data[index]
            
            self.area_details.delete("1.0", tk.END)
            self.area_details.insert(tk.END, f"Name: {area.get('Name')}\n")
            self.area_details.insert(tk.END, f"ID: {area.get('ID')}\n")
            self.area_details.insert(tk.END, f"ReportingID: {area.get('ReportingID')}")
    
    def on_output_selected(self, event):
        """When user selects an output, show its details"""
        index = self.outputs_combo.current()
        if index >= 0 and index < len(self.outputs_data):
            output = self.outputs_data[index]
            
            self.output_details.delete("1.0", tk.END)
            self.output_details.insert(tk.END, f"Name: {output.get('Name')}\n")
            self.output_details.insert(tk.END, f"ID: {output.get('ID')}\n")
            self.output_details.insert(tk.END, f"ReportingID: {output.get('ReportingID')}")

    def on_unlockbtn(self):
        index = self.outputs_combo.current()           # Get the index (0, 1, 2...)
        door = self.outputs_data[index]                # Get the door dictionary from your stored data
        door_id = door["ID"]                           # Get the actual GUID
        self.client.control_output(door_id)  



# Run the application
if __name__ == "__main__":
    root = tk.Tk()
    app = InceptionGUI(root)
    root.mainloop()
